const fs = require('fs');
const readline = require('readline');
const path = require('path');
const {
  dialog
} = require('@electron/remote')

let index = 0; // 当前显示的文件索引
let lines = []; // 保存文件ID以供导航
let fileData = {}; // 存储文件ID对应文本的字典
let tagData = {}; // 存储文件ID对应标签的字典

document.getElementById('setting').addEventListener('click', function () {
  let settingPanel = document.getElementById('settingPanel');
  settingPanel.style.display = settingPanel.style.display === 'none' ? 'block' : 'none';
  this.innerText = settingPanel.style.display === 'block' ? 'Hide setting' : 'Show setting';
});

document.getElementById('addTag').addEventListener('click', function () {
  let newTag = document.getElementById('newTag').value;
  let tags = document.getElementById('tags');
  let tag = document.createElement('button');
  tag.innerText = newTag;
  tag.className = 'tag';
  bindTagClickEvent(tag);
  tags.appendChild(tag);
  document.getElementById('newTag').value = '';
  settingPanel.style.display = 'none';
  this.innerText = 'Show setting';
})

let tagReader = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, 'data', 'tags.txt'))
});
tagReader.on('line', function (line) {
  let tags = document.getElementById('tags');
  let tag = document.createElement('button');
  tag.innerText = line;
  tag.className = 'tag';
  bindTagClickEvent(tag);
  tags.appendChild(tag);
});

function readAndProcessInputFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const lineReader = readline.createInterface({
    input: fileStream
  });

  lineReader.on('line', function (line) {
    const parts = line.split(' ');
    const fileId = parts.shift();
    const textContent = parts.join(' ');
    fileData[fileId] = textContent;
    lines.push(fileId);
  });

  lineReader.on('close', function () {
    console.log('Finished reading file');
    displayCurrentFileData(index);
  });
}

function displayCurrentFileData(idx) {
  if (idx >= 0 && idx < lines.length) {
    const fileId = lines[idx];
    document.getElementById('name').innerText = fileId;
    document.getElementById('content').innerText = fileData[fileId];
    const currentTag = tagData[fileId] || 'No tag';
    document.getElementById('selectTag').innerText = 'Current tag: ' + currentTag; // 显示当前标签
  }
}

function updateTag(fileId, tag) { // 更新文件中的标签
  tagData[fileId] = tag;

  document.getElementById('selectTag').innerText = 'Tag updated: ' + tag; // 更新标签显示
}

function bindTagClickEvent(tag) {
  tag.addEventListener('click', function () {
    const currentFileId = document.getElementById('name').innerText;
    const tagAlreadyExists = tagData[currentFileId];
    if (tagAlreadyExists && tagAlreadyExists !== this.innerText) {
      if (confirm('Change tag from ' + tagAlreadyExists + ' to ' + this.innerText + '?')) {
        updateTag(currentFileId, this.innerText);
      }
    } else if (!tagAlreadyExists || tagAlreadyExists === this.innerText) {
      updateTag(currentFileId, this.innerText);
    }
  });
}

document.getElementById('selectFile').addEventListener('click', function () {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{
      name: 'Text Files',
      extensions: ['txt']
    }]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      readAndProcessInputFile(result.filePaths[0]);
    }
  }).catch(err => {
    console.error('Failed to open file dialog:', err);
  });
});
document.getElementById('exportData').addEventListener('click', function () {
  dialog.showSaveDialog({
    title: 'Export data',
    defaultPath: path.join(__dirname, 'data', 'output.txt'),
    buttonLabel: 'Export',
    filters: [{
      name: 'Text Files',
      extensions: ['txt']
    }]
  }).then(result => {
    if (!result.canceled) {
      //循环fileData，将每个文件ID和文本内容和tag写入文件
      const data = lines.map(fileId => {
        const textContent = fileData[fileId];
        const tag = tagData[fileId] || 'No tag';
        return `${fileId} ${textContent} ${tag}`;
      }).join('\n');

      fs.writeFileSync(path.join(__dirname, 'data', 'output.txt'), data);

    }
  }).catch(err => {
    console.error('Failed to export data:', err);
  });

})
document.getElementById('prev').addEventListener('click', function () {
  if (index > 0) {
    index--;
    displayCurrentFileData(index);
  }
});

document.getElementById('next').addEventListener('click', function () {
  if (index < lines.length - 1) {
    index++;
    displayCurrentFileData(index);
  }
});