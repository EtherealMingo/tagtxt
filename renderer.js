const fs = require('fs');
const readline = require('readline');
const path = require('path');
const {
  dialog
} = require('@electron/remote')

document.getElementById('setting').addEventListener('click', function () {
  let setting = document.getElementById('setting');
  let settingPanel = document.getElementById('settingPanel');
  if (settingPanel.style.display === 'none') {
    settingPanel.style.display = 'block';
    setting.innerText = 'Hide setting';
  } else {
    settingPanel.style.display = 'none';
    setting.innerText = 'Show setting';
  }
});

//侧边添加一个设置按钮，我可以在设置中添加tag或者删除tag
document.getElementById('addTag').addEventListener('click', function () {
  let newTag = document.getElementById('newTag').value;
  let tags = document.getElementById('tags');
  let tag = document.createElement('button');
  tag.innerText = newTag;
  tag.className = 'tag';
  // 为新添加的 tag 绑定点击事件
  bindTagClickEvent(tag);
  tags.appendChild(tag);
  document.getElementById('newTag').value = '';
  settingPanel.style.display = 'none';
  setting.innerText = 'Show setting';
})

//读取data文件夹下的tags.txt文件，每行文本就是一个tag,将这些显示在页面上
let tagReader = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, 'data', 'tags.txt'))
});
tagReader.on('line', function (line) {
  let tags = document.getElementById('tags');
  let tag = document.createElement('button');
  tag.innerText = line;
  tag.className = 'tag';
  // 为新添加的 tag 绑定点击事件
  bindTagClickEvent(tag);
  tags.appendChild(tag);
});
let lineReader = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, 'data', 'input.txt'))
});

let lines = [];
lineReader.on('line', function (line) {
  console.log(line);
  lines.push([line.split(' ')[0], line.split(' ').slice(1).join(' ')]);
});

let index = 0;
document.getElementById('next').addEventListener('click', function () {
  document.getElementById('selectTag').innerText = 'Please select the Tag.';
  if (index < lines.length) {
    console.log(lines[index])
    document.getElementById('name').innerText = lines[index][0];
    document.getElementById('content').innerText = lines[index][1];
    index++;
  }
});
//页面加个上一个按钮
document.getElementById('prev').addEventListener('click', function () {
  document.getElementById('selectTag').innerText = 'Please select the Tag.';
  if (index > 0) {
    index--;
    console.log(lines[index])
    document.getElementById('name').innerText = lines[index][0];
    document.getElementById('content').innerText = lines[index][1];
  }
});

function bindTagClickEvent(tag) {
  tag.addEventListener('click', function () {
    let newLine = lines[index - 1][0] + ' ' + lines[index - 1][1] + ' ' + this.innerText + '\n';
    document.getElementById('selectTag').innerText = this.innerText;
    let oldFile = fs.readFileSync(path.join(__dirname, 'data', 'output.txt'), 'utf-8');
    let oldLine = lines[index - 1][0] + ' ' + lines[index - 1][1];
    if (oldFile.includes(oldLine)) {
      let userChoice = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'This line already has a tag. Do you want to update it?'
      });
      if (userChoice === 0) {
        let regex = new RegExp('^' + oldLine + ' .*$', 'gm');
        let newFile = oldFile.replace(regex, '');
        fs.writeFileSync(path.join(__dirname, 'data', 'output.txt'), newFile + newLine);
      }
    } else {
      fs.appendFileSync(path.join(__dirname, 'data', 'output.txt'), newLine);
    }
  });
  // 为新添加的 tag 绑定鼠标右击事件
  tag.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    let userChoice = dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Do you want to delete this tag?'
    });
    if (userChoice === 0) {
      this.remove();
    }
  });
}
document.querySelectorAll('.tag').forEach(bindTagClickEvent);