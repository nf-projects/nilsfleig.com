'use client';

import React, { useState, useEffect } from 'react';
import ePub from 'epubjs';
import { Upload, FileText, Download, Loader2, BookOpen } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

const EpubConverter: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [error, setError] = useState('');
  
  // Settings
  const [fontSize, setFontSize] = useState(12);
  const [lineHeight, setLineHeight] = useState(1.6);

  const processEpub = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    setChapters([]);
    setProgress(0);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const book = ePub(arrayBuffer);
      
      // Wait for the book to be fully opened
      await book.ready;
      
      // Get Metadata
      const metadata = await book.loaded.metadata;
      setBookTitle(metadata.title || 'Untitled');
      setBookAuthor(metadata.creator || 'Unknown Author');

      // Get navigation (table of contents) for chapter titles
      const navigation = await book.loaded.navigation;
      const tocMap = new Map<string, string>();
      if (navigation?.toc) {
        navigation.toc.forEach((item: any) => {
          tocMap.set(item.href?.split('#')[0], item.label);
        });
      }

      // Get spine items
      const spineItems: any[] = [];
      book.spine.each((item: any) => {
        spineItems.push(item);
      });

      const totalItems = spineItems.length;
      const loadedChapters: Chapter[] = [];

      for (let i = 0; i < spineItems.length; i++) {
        const item = spineItems[i];
        
        try {
          // Load section content
          const section = await book.section(item.href || item.index);
          if (!section) {
            setProgress(Math.round(((i + 1) / totalItems) * 100));
            continue;
          }
          
          const contents = await section.load(book.load.bind(book));
          
          if (contents && contents.body) {
            // Get chapter title from TOC or generate one
            const chapterTitle = tocMap.get(item.href) || 
                                 tocMap.get(item.canonical) ||
                                 `Section ${i + 1}`;
            
            // Clean up content - get HTML from document body
            let htmlContent = contents.body.innerHTML;
            
            // Remove script tags
            htmlContent = htmlContent.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
            
            // Remove style tags (we'll use our own styling)
            htmlContent = htmlContent.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
            
            // Skip empty or whitespace-only content
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
      
      // Cleanup
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

  // Inject styles only on client to avoid hydration mismatch
  useEffect(() => {
    const styleId = 'epub-converter-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&display=swap');
        
        .epub-page {
            font-family: 'Source Serif 4', 'Charter', 'Georgia', serif;
        }

        /* Hide nav/footer/header */
        .scanlines, nav, footer, header { 
          display: none !important; 
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
        }

        @media print {
            nav, footer, header, .scanlines {
                display: none !important;
                visibility: hidden !important;
            }
            @page {
                size: letter portrait;
                margin: 0.6in 0.75in 0.8in 0.75in;
                @bottom-center {
                    content: counter(page);
                    font-family: 'Source Serif 4', 'Charter', 'Georgia', serif;
                    font-size: 10pt;
                    color: #666;
                }
            }
            html, body {
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .no-print {
                display: none !important;
            }
            .chapter-section {
                break-inside: avoid-page;
            }
            .page-break {
                break-before: page;
            }
        }

        /* Book content typography - iBooks inspired */
        .book-content {
            color: #1d1d1f;
        }
        .book-content p {
            margin-bottom: 1em;
            text-align: justify;
            text-indent: 1.5em;
            hyphens: auto;
            -webkit-hyphens: auto;
        }
        .book-content p:first-of-type {
            text-indent: 0;
        }
        .book-content h1, .book-content h2, .book-content h3, .book-content h4 {
            margin-top: 1.5em;
            margin-bottom: 0.75em;
            font-weight: 600;
            line-height: 1.25;
            text-indent: 0 !important;
            text-align: left !important;
        }
        .book-content h1 { font-size: 1.75em; }
        .book-content h2 { font-size: 1.4em; }
        .book-content h3 { font-size: 1.15em; }
        .book-content img {
            max-width: 100%;
            height: auto;
            margin: 1.5em auto;
            display: block;
        }
        .book-content blockquote {
            margin: 1.5em 0;
            padding-left: 1.25em;
            border-left: 3px solid #d1d1d6;
            font-style: italic;
            color: #636366;
        }
        .book-content a {
            color: #007aff;
            text-decoration: none;
        }
        .book-content ul, .book-content ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        .book-content li {
            margin-bottom: 0.5em;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #18181b; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #52525b; }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 print:bg-white print:text-black">

      {/* Control Bar */}
      <div className="no-print fixed top-0 left-0 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-zinc-100 font-mono">
                    <BookOpen size={20} strokeWidth={1.5} />
                    <span className="text-sm">EPUB → PDF</span>
                </div>
                {fileName && (
                    <span className="text-xs text-zinc-500 border-l pl-4 border-zinc-800 truncate max-w-[200px] font-mono">
                        {fileName}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                {!isLoading && chapters.length > 0 && (
                    <div className="flex items-center gap-4 mr-2 border-r pr-4 border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wide">Size</span>
                            <input 
                                type="range" 
                                min="10" 
                                max="16" 
                                value={fontSize} 
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-20 accent-primary"
                            />
                            <span className="text-xs text-zinc-400 w-6 font-mono">{fontSize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wide">Line</span>
                            <input 
                                type="range" 
                                min="1.4" 
                                max="2.0" 
                                step="0.1"
                                value={lineHeight} 
                                onChange={(e) => setLineHeight(Number(e.target.value))}
                                className="w-20 accent-primary"
                            />
                            <span className="text-xs text-zinc-400 w-6 font-mono">{lineHeight}</span>
                        </div>
                    </div>
                )}

                <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded text-sm font-mono transition-colors flex items-center gap-2">
                    <Upload size={16} />
                    Upload
                    <input type="file" accept=".epub" onChange={handleFileUpload} className="hidden" />
                </label>

                {chapters.length > 0 && (
                    <button 
                        onClick={() => window.print()}
                        className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-2 rounded text-sm font-mono transition-colors flex items-center gap-2"
                    >
                        <Download size={16} />
                        Save PDF
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-16 px-6 min-h-screen epub-page">
        {/* Upload State */}
        {!isLoading && chapters.length === 0 && (
            <div className="max-w-md mx-auto mt-24 text-center">
                <div className="w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <FileText size={36} className="text-zinc-400" />
                </div>
                <h2 className="text-2xl font-mono text-zinc-100 mb-2">Convert your eBook</h2>
                <p className="text-zinc-400 mb-8 text-sm font-mono">
                    Upload an .epub file to create a PDF, optimized for reading and annotation.
                </p>
                
                {error && (
                    <div className="mb-6 p-4 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 text-sm font-mono">
                        {error}
                    </div>
                )}
                
                <label className="cursor-pointer bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-3 rounded font-mono transition-colors inline-flex items-center gap-2">
                    <Upload size={20} />
                    Select EPUB File
                    <input type="file" accept=".epub" onChange={handleFileUpload} className="hidden" />
                </label>
            </div>
        )}

        {/* Loading State */}
        {isLoading && (
            <div className="max-w-md mx-auto mt-24 text-center">
                <Loader2 className="animate-spin text-primary mx-auto mb-5" size={48} strokeWidth={1.5} />
                <h3 className="text-xl font-mono text-zinc-100 mb-3">Processing Book...</h3>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2 max-w-xs mx-auto overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-zinc-400 text-sm font-mono">{progress}% complete</p>
            </div>
        )}

        {/* Book Content */}
        {chapters.length > 0 && (
            <div 
                className="max-w-[680px] mx-auto bg-white print:bg-white print:shadow-none print:max-w-none px-12 py-16 md:px-16 md:py-20 book-content border border-zinc-800 print:border-none"
                style={{
                    fontSize: `${fontSize}pt`,
                    lineHeight: lineHeight
                }}
            >
                {/* Title Page */}
                <div className="text-center mb-16 pb-12 border-b border-gray-100 print:border-gray-300">
                    <h1 className="text-4xl font-semibold mb-4 text-[#1d1d1f] leading-tight" style={{ textIndent: 0 }}>
                        {bookTitle}
                    </h1>
                    <p className="text-xl text-gray-500 italic">{bookAuthor}</p>
                </div>

                {/* Chapters */}
                {chapters.map((chapter, idx) => (
                    <div key={chapter.id} className="chapter-section mb-12">
                        {/* Chapter content */}
                        <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                        
                        {/* Divider between chapters (screen only) */}
                        {idx < chapters.length - 1 && (
                            <div className="no-print h-px bg-gray-100 my-12 mx-auto w-1/4"></div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default EpubConverter;

