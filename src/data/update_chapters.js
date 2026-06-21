const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, 'chapters');
const files = fs.readdirSync(chaptersDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(chaptersDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    let updated = false;
    const newData = data.map(chapter => {
      if (!chapter.resource) {
        updated = true;
        return {
          ...chapter,
          resource: {
            name: `${chapter.title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_Slides.pdf`,
            size: (Math.random() * 3 + 1).toFixed(1) + ' MB',
            url: '#'
          }
        };
      }
      return chapter;
    });

    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
    }
  }
});
