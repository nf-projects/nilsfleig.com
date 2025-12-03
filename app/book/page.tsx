'use client';

import React, { useState } from 'react';
import ePub from 'epubjs';
import { Upload, FileText, Download, Loader2, BookOpen } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

export default function EpubConverter() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [error, setError] = useState('');
  
  // Settings
  const [fontSize, setFontSize] = useState(12);
  const [lineHeight, setLineHeight] = useState(1.7);

  const processEpub = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    setChapters([]);
    setProgress(0);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const book = ePub(arrayBuffer);
      
      await book.ready;
      
      const metadata = await book.loaded.metadata;
      setBookTitle(metadata.title || 'Untitled');
      setBookAuthor(metadata.creator || 'Unknown Author');

      const navigation = await book.loaded.navigation;
      const tocMap = new Map<string, string>();
      if (navigation?.toc) {
        navigation.toc.forEach((item: any) => {
          tocMap.set(item.href?.split('#')[0], item.label);
        });
      }

      const spineItems: any[] = [];
      book.spine.each((item: any) => {
        spineItems.push(item);
      });

      const totalItems = spineItems.length;
      const loadedChapters: Chapter[] = [];

      for (let i = 0; i < spineItems.length; i++) {
        const item = spineItems[i];
        
        try {
          const section = await book.section(item.href || item.index);
          if (!section) {
            setProgress(Math.round(((i + 1) / totalItems) * 100));
            continue;
          }
          
          const contents = await section.load(book.load.bind(book));
          
          if (contents) {
            const chapterTitle = tocMap.get(item.href) || 
                                 tocMap.get(item.canonical) ||
                                 `Section ${i + 1}`;
            
            let htmlContent = '';
            
            if (contents.body && contents.body.innerHTML) {
              htmlContent = contents.body.innerHTML;
            } else if (contents.documentElement && contents.documentElement.innerHTML) {
              htmlContent = contents.documentElement.innerHTML;
            } else if (typeof contents === 'string') {
              htmlContent = contents;
            } else {
              const serializer = new XMLSerializer();
              htmlContent = serializer.serializeToString(contents.body || contents.documentElement || contents);
            }
            
            // Clean up content
            htmlContent = htmlContent.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
            htmlContent = htmlContent.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
            
            const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
            if (textContent.length > 10) {
              loadedChapters.push({
                id: item.idref || `chapter-${i}`,
                title: chapterTitle,
                content: htmlContent
              });
            }
          }
        } catch (sectionError) {
          console.warn(`Could not load section ${i}:`, sectionError);
        }
        
        setProgress(Math.round(((i + 1) / totalItems) * 100));
      }

      if (loadedChapters.length === 0) {
        throw new Error('No readable content found in the EPUB file.');
      }

      setChapters(loadedChapters);
      setIsLoading(false);
      book.destroy();
      
    } catch (err) {
      console.error("Error parsing epub:", err);
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Unknown error parsing EPUB file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processEpub(file);
    }
  };

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --paper: #fdfcfa;
          --ink: #2d2a26;
          --accent: #8b7355;
        }

        body {
          font-family: 'Crimson Pro', Georgia, serif;
          background: #f5f4f2;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* The book page container - what you see is what you print */
        .book-page {
          background: var(--paper);
          color: var(--ink);
          max-width: 680px;
          margin: 0 auto;
          padding: 60px 72px;
          min-height: 100vh;
          box-shadow: 0 0 60px rgba(0,0,0,0.08);
        }

        /* Typography */
        .book-page p {
          margin: 0 0 1em 0;
          text-align: justify;
          text-indent: 1.5em;
          hyphens: auto;
          -webkit-hyphens: auto;
        }

        .book-page p:first-of-type {
          text-indent: 0;
        }

        .book-page h1, .book-page h2, .book-page h3, .book-page h4, .book-page h5, .book-page h6 {
          font-weight: 500;
          line-height: 1.3;
          margin: 1.5em 0 0.75em 0;
          text-indent: 0 !important;
        }

        .book-page h1 { font-size: 2em; text-align: center; }
        .book-page h2 { font-size: 1.5em; }
        .book-page h3 { font-size: 1.25em; font-style: italic; }

        .book-page blockquote {
          margin: 1.5em 2em;
          font-style: italic;
          color: #555;
        }

        .book-page a {
          color: inherit;
          text-decoration: underline;
          text-decoration-color: var(--accent);
        }

        .book-page img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 2em auto;
        }

        .book-page ul, .book-page ol {
          margin: 1em 0 1em 2em;
        }

        .book-page li {
          margin-bottom: 0.5em;
        }

        /* Title page styling */
        .title-section {
          text-align: center;
          padding: 80px 0 60px 0;
          border-bottom: 1px solid #e8e6e3;
          margin-bottom: 40px;
        }

        .title-section h1 {
          font-size: 2.5em;
          font-weight: 400;
          margin: 0 0 0.5em 0;
          letter-spacing: -0.02em;
        }

        .title-section .author {
          font-size: 1.3em;
          font-style: italic;
          color: var(--accent);
        }

        /* Chapter divider */
        .chapter-divider {
          border: none;
          text-align: center;
          margin: 3em 0;
        }

        .chapter-divider::before {
          content: "• • •";
          color: var(--accent);
          letter-spacing: 0.5em;
        }

        /* Control bar - hidden in print */
        .control-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(45, 42, 38, 0.97);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: system-ui, -apple-system, sans-serif;
          color: #fdfcfa;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .control-bar button,
        .control-bar label {
          background: rgba(255,255,255,0.1);
          border: none;
          color: inherit;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .control-bar button:hover,
        .control-bar label:hover {
          background: rgba(255,255,255,0.2);
        }

        .control-bar .primary-btn {
          background: var(--accent);
        }

        .control-bar .primary-btn:hover {
          background: #9d856a;
        }

        .control-bar input[type="range"] {
          width: 80px;
          accent-color: var(--accent);
        }

        /* Upload state */
        .upload-state {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 60px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .upload-box {
          text-align: center;
          max-width: 400px;
        }

        .upload-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--accent), #6b5a47);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
          color: white;
        }

        .upload-box h2 {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--ink);
        }

        .upload-box p {
          color: #666;
          margin-bottom: 24px;
          font-size: 15px;
        }

        .upload-btn {
          background: var(--accent);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
        }

        .upload-btn:hover {
          background: #9d856a;
          transform: translateY(-1px);
        }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        /* Loading state */
        .loading-state {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 60px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .loading-box {
          text-align: center;
        }

        .progress-bar {
          width: 200px;
          height: 4px;
          background: #e5e5e5;
          border-radius: 2px;
          overflow: hidden;
          margin: 16px auto;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 0.3s;
        }

        /* Print styles - keep layout identical, just hide chrome and set margins */
        @media print {
          body {
            background: var(--paper) !important;
          }

          .control-bar,
          .no-print {
            display: none !important;
          }

          /* Extra breathing room at the top of each printed page */
          .book-page {
            padding-top: 32px;
          }

          @page {
            size: letter;
            margin: 0.75in 1in;
          }
        }
      `}</style>

      {/* Control Bar */}
      <div className="control-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} />
            <span style={{ fontWeight: 600 }}>EPUB → PDF</span>
          </div>
          {fileName && (
            <span style={{ fontSize: '13px', opacity: 0.6, borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
              {fileName}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isLoading && chapters.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginRight: '8px', paddingRight: '16px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.5 }}>Size</span>
                <input 
                  type="range" 
                  min="10" 
                  max="16" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
                <span style={{ fontSize: '12px', width: '20px' }}>{fontSize}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.5 }}>Line</span>
                <input 
                  type="range" 
                  min="1.4" 
                  max="2.0" 
                  step="0.1"
                  value={lineHeight} 
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                />
                <span style={{ fontSize: '12px', width: '24px' }}>{lineHeight}</span>
              </div>
            </div>
          )}

          <label style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            Upload
            <input type="file" accept=".epub" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          {chapters.length > 0 && (
            <button onClick={() => window.print()} className="primary-btn">
              <Download size={16} />
              Save PDF
            </button>
          )}
        </div>
      </div>

      {/* Upload State */}
      {!isLoading && chapters.length === 0 && (
        <div className="upload-state">
          <div className="upload-box">
            <div className="upload-icon">
              <FileText size={36} />
            </div>
            <h2>Convert your eBook</h2>
            <p>Upload an .epub file to create a beautiful PDF for reading and annotation.</p>
            
            {error && <div className="error-box">{error}</div>}
            
            <label className="upload-btn" style={{ cursor: 'pointer' }}>
              <Upload size={20} />
              Select EPUB File
              <input type="file" accept=".epub" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="loading-box">
            <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h3 style={{ marginTop: '16px', fontSize: '18px' }}>Processing Book...</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ fontSize: '14px', color: '#666' }}>{progress}% complete</p>
          </div>
        </div>
      )}

      {/* Book Content - This is exactly what gets printed */}
      {chapters.length > 0 && (
        <div style={{ paddingTop: '60px' }}>
          <div 
            className="book-page"
            style={{
              fontSize: `${fontSize}pt`,
              lineHeight: lineHeight
            }}
          >
            {/* Title Page */}
            <div className="title-section">
              <h1>{bookTitle}</h1>
              <p className="author">{bookAuthor}</p>
            </div>

            {/* Chapters */}
            {chapters.map((chapter, idx) => (
              <div key={chapter.id}>
                <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                {idx < chapters.length - 1 && <hr className="chapter-divider" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
