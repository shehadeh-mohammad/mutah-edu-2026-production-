const fs = require('fs');
const path = require('path');

const courses = [
  { id: 'ai101', title: 'مقدمة في الذكاء الاصطناعي', videoId: 'JMUxmLyrhSk' },
  { id: 'ai201', title: 'أساسيات تعلم الآلة', videoId: 'Gv9_4yMHFhI' },
  { id: 'ai301', title: 'الشبكات العصبية والتعلم العميق', videoId: 'aircAruvnKk' },
  { id: 'cis101', title: 'مقدمة في مستودع البيانات', videoId: 'J3m6H_nS7f8' },
  { id: 'cis201', title: 'ابتكارات جديدة في نظم المعلومات', videoId: '2V6B-hI9w1M' },
  { id: 'cis301', title: 'نظم المعلومات الإدارية المتقدمة', videoId: '6T_O4h5j4oA' },
  { id: 'cis401', title: 'إدارة قواعد البيانات المؤسسية', videoId: 'HXV3zeJZ1EQ' },
  { id: 'cis402', title: 'طرق تحليل النظم', videoId: '5Z13_r-U7hM' },
  { id: 'cy101', title: 'أساسيات أمن الشبكات', videoId: 'inWWhr5tnEA' },
  { id: 'cy201', title: 'علم التشفير', videoId: 'jhXCTbFnK8o' }
];

const chaptersDir = path.join(__dirname, 'chapters');

courses.forEach(course => {
  const chapterData = [
    {
      id: `ch-${course.id}-1`,
      courseId: course.id,
      title: course.title,
      videoId: course.videoId,
      slidesTitle: "مقدمة عامة",
      duration: "20 min",
      order: 1,
      description: "نظرة عامة وشاملة لمواضيع هذا المساق."
    }
  ];
  fs.writeFileSync(path.join(chaptersDir, `${course.id}.json`), JSON.stringify(chapterData, null, 2));
});
