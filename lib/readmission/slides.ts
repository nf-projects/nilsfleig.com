// Generated from presentation/group15_slides.pptx in nf-projects/ecs171-readmission.
export type Slide = { title: string; notes: string; image: string | null; demo: boolean };
export const slides: Slide[] = [
  {
    "title": "Regularized Gradient Boosting for Hospital Readmission Prediction",
    "notes": "Nils: Hi, we're group 15. Our paper was the XGBoost paper. We used it to predict hospital readmissions for diabetic patients.",
    "image": "/171/slide-01.png",
    "demo": false
  },
  {
    "title": "Can we predict who comes back within 30 days?",
    "notes": "Nils: Medicare cuts payments to hospitals with too many readmissions, and follow up care is limited, so it helps to know who is high risk at discharge. XGBoost builds trees one at a time, each one fixing earlier errors. It adds regularization, and it learns which way missing values should go at each split. The paper shows this makes training faster. We wanted to know if it makes predictions better on real hospital data. So we have two questions.",
    "image": "/171/slide-02.png",
    "demo": false
  },
  {
    "title": "Readmission is rare and prior visits are the strongest signal",
    "notes": "Alex: We used the UCI Diabetes 130 hospitals data. About 100 thousand encounters from 1999 to 2008. Only 11 percent come back within 30 days, so accuracy is useless. Always saying no gets almost 89 percent. So our main metric is PR-AUC. The best single signal is prior inpatient visits. It goes from about 9 percent with none to 37 percent with five or more.",
    "image": "/171/slide-03.png",
    "demo": false
  },
  {
    "title": "The data has a lot of missing values, and some of them mean something",
    "notes": "Alex: Weight is almost always missing. A1C wasn't tested for 83 percent of encounters. That's not random, a test not being ordered tells you something. Encounters with an A1C were readmitted 9.9 percent of the time, without it 11.7. Two setup choices matter. We split by patient since 16 thousand patients show up more than once. And we removed death and hospice discharges.",
    "image": "/171/slide-04.png",
    "demo": false
  },
  {
    "title": "We tuned three models and tested once on held-out patients",
    "notes": "Nils: We hold out 20 percent of patients as a test set and use it one time at the end. We tune with random search, grouped by patient. For missing values we made all of a missing category's one hot columns NaN. If theyre just zeros, XGBoost never sees a missing value at all. Class weights didnt help any model's PR-AUC, so we handle imbalance by choosing the threshold instead.",
    "image": "/171/slide-05.png",
    "demo": false
  },
  {
    "title": "Q1: XGBoost scored best, but only clearly beat logistic regression",
    "notes": "Nils: XGBoost got the best scores, PR-AUC 0.262 and ROC-AUC 0.689. The difference with logistic regression is clear. Against random forest it's small. It wins on ROC-AUC, but on PR-AUC the confidence interval on the difference includes zero. So we cant say it wins on our main metric. These test scores are also a bit higher than cross validation, which was 0.226, so the CV number is the safer estimate.",
    "image": "/171/slide-06.png",
    "demo": false
  },
  {
    "title": "Q2: Native handling wins slightly, because missing values carry signal",
    "notes": "Nils: Native handling is tied with treating missing as its own category, and slightly above mode and KNN. KNN cost 46 extra seconds per fold and gave nothing. Why does native win? We tested it by hiding values completely at random, so missing means nothing. The edge goes away. So it isnt recovering hidden values. It's using the fact that something is missing. That matches another health data benchmark, Perez-Lebel 2022.",
    "image": "/171/slide-07.png",
    "demo": false
  },
  {
    "title": "Prior visits and discharge destination drive the model, and it's a ranking tool",
    "notes": "Alex: The top features are prior inpatient visits and discharge destination. At the best F1 threshold we flag 26 percent of encounters and catch about half of readmissions. So about 1 in 5 flags is correct. If staff could only follow up with the top 5 percent, 38 percent of those are real, about 3.3 times the base rate. So it's most useful for ordering a follow up list.",
    "image": "/171/slide-08.png",
    "demo": false
  },
  {
    "title": "Live demo",
    "notes": "Alex: This is the model running in a web page, right here in the browser. Click the lower risk example, then the higher risk example. Then change inpatient visits on the higher risk patient from 5 to 0 and predict again, so everyone can see the risk drop. It shows the risk, whether it passes the follow up threshold, and what moved the prediction. BACKUP: if it fails, use the screenshot on the next slide.",
    "image": null,
    "demo": true
  },
  {
    "title": "Demo backup",
    "notes": "Alex: Only use this if the live demo fails. Walk through the example: 75 year old, 5 prior inpatient visits, sent to rehab, 25.0 percent risk and flagged. Otherwise skip this slide.",
    "image": "/171/slide-10.png",
    "demo": false
  },
  {
    "title": "Ethics: useful for offering help, not for making decisions",
    "notes": "Nils: Recall is close for Caucasian and African American patients, about 0.5. It's lower for Asian patients and patients with missing race, but those are only 13 and 42 positive cases so we cant be sure. That's a problem too, since we cant confirm it works for small groups. It ranks patients over 70 worse than patients under 50. Removing race barely changes the score, but payer and prior visits can act as proxies. Readmission also depends on access to care. And the data is 1999 to 2008. So use it only to offer extra help, with a clinician deciding, and audit it first.",
    "image": "/171/slide-11.png",
    "demo": false
  },
  {
    "title": "Takeaways",
    "notes": "Nils: Three takeaways. XGBoost was best but not by much, and the data limits everyone. Keeping missing values visible matters more than how you fill them. And good evaluation matters as much as the model, so the honest answer here is a useful ranking tool, not a clinical one. We also learned that a method that's great on the paper's benchmarks doesnt always have a big edge in practice. Thanks, any questions?",
    "image": "/171/slide-12.png",
    "demo": false
  }
];
