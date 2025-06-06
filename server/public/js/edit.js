'use strict';
(function() {

const questions_div = document.querySelector('.questions');
const add_question_btn = document.querySelector('.add_question_btn');
const upload_quiz_btn = document.querySelector('.upload_quiz_btn');
const enter_password_div = document.querySelector('.enter_password');
let cur_editor = null; // input, currently active
let cur_json = null; // json that will be sent to the server

function on_add_question(e) {
    let div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = `
        <div class="image">
            <img src="/img/placeholder.webp" />
        </div>
        <div class="text">
          <h2><span class="qwording editable">What will the question be?</span>
            <input class="editor hidden" />
            <button class="ebtn"
                data-action="edit">Edit</button>
          </h2>
          <p class="option">
            <span>
              <input type="radio" value="Yes" />
              <label class="answer editable">Yes</label>
              <input class="editor hidden" />
              <button class="ebtn" data-action="edit">Edit</button>
            </span>
            <span class="side_note">
              Points: <span class="points editable">1</span>
              <input type="number" class="editor hidden" />
              <button class="ebtn" data-action="edit">Edit</button>
            </span>
          </p>
          <p class="option">
            <span>
              <input type="radio" value="No" />
              <label class="answer editable">No</label>
              <input class="editor hidden">
              <button class="ebtn" data-action="edit">Edit</button>
            </span>
            <span class="side_note">
              Points: <span class="points editable">0</span>
              <input type="number" class="editor hidden" />
              <button class="ebtn" data-action="edit">Edit</button>
            </span>
          </p>

          <button data-action="add_option">Add an Answer Option</button>
        </div>
`;
    questions_div.append(div);
}

function on_add_option(e) {
    const btn = e.target;
    const parent_node = btn.parentNode;
    const node = document.createElement('p');
    node.classList.add('option');
    node.innerHTML = `
            <span>
              <input type="radio" value="Sometimes" />
              <label class="answer editable">Sometimes</label>
              <input class="editor hidden">
              <button class="ebtn" data-action="edit">Edit</button>
            </span>
            <span class="side_note">
              Points: <span class="points editable">0</span>
              <input type="number" class="editor hidden" />
              <button class="ebtn" data-action="edit">Edit</button>
            </span>
`;
    parent_node.insertBefore(node, btn);
}

function add_question(question, points) {
    console.log('adding question', points);
    let div = document.createElement('div');
    div.classList.add('question');
    let html = `
        <div class="image">
            <img src="/img/placeholder.webp" />
        </div>
        <div class="text">
          <h2><span class="qwording editable">${question.question}</span>
            <input class="editor hidden" />
            <button class="ebtn"
                data-action="edit">Edit</button>
          </h2>
`;
    for(let i = 0; i < question.options.length; ++i) {
        html += `
          <p>
            <span>
              <input type="radio" value="${question.options[i]}" />
              <label class="answer editable">${question.options[i]}</label>
              <input class="editor hidden">
              <button class="ebtn" data-action="edit">Edit</button>
            </span>
            <span class="side_note">
              Points: <span class="points editable">${points.options[i][1]}</span>
              <input type="number" class="editor hidden" />
              <button class="ebtn" data-action="edit">Edit</button>
            </span>
          </p>
`;
    }
    html += `
         <button data-action="add_option">Add an Answer Option</button>
        </div>
`
    div.innerHTML = html;
    questions_div.append(div);
}

function parse_qjson(qjson) {
    console.log('parsing qjson', qjson);
    if(!qjson.questions || !qjson.points || qjson.questions.length < 1 ||
            qjson.points.length !== qjson.questions.length) {
        console.error('invalid quiz data received from the server');
        return;
    }

    for(let i = 0; i < qjson.questions.length; ++i) {
        add_question(qjson.questions[i], qjson.points[i]);
    }
}

function on_upload_quiz() {
    const quiz = {
        questions: [],
        points: []
    }

    const questions = questions_div.querySelectorAll('.question');
    for(let i = 0; i < questions.length; ++i) {
        const qwording = questions[i].querySelector('.qwording').innerText;
        const q = {
            qtype: 'radio',
            image: '',
            question: qwording,
            options: []
        };
        const p = {
            options: []
        };
        const options = questions[i].querySelectorAll('.option');
        console.log('number of options: ', options.length)
        for(let j = 0; j < options.length; ++j) {
            const option = options[j].querySelector('.answer').innerText;
            const points = options[j].querySelector('.points').innerText;
            q.options.push(option);
            p.options.push([option, points]);
        }
        quiz.questions.push(q);
        quiz.points.push(p);
    }

    cur_json = quiz;

    const preview = document.querySelector('.modal.json_preview');
    const preview_content = preview.querySelector('.content')
    console.log(preview_content);
    preview_content.innerText = JSON.stringify(quiz, null, 2);
    preview.classList.remove('hidden');
}

function on_edit_done() {
    if(!cur_editor) {
        return;
    }
    const editable = cur_editor.parentNode.querySelector('.editable');
    const editor = cur_editor.parentNode.querySelector('.editor');
    const ebtn = cur_editor.parentNode.querySelector('.ebtn');

    editable.innerText = editor.value;
    editable.classList.remove('hidden');
    editor.classList.add('hidden');
    ebtn.innerText = 'Edit';
    cur_editor = null;
}

function on_edit_wording(e) {
    if(cur_editor) {
        // we are in the editing mode right now.
        // if same edit button pressed, we return. if different, however,
        // we don't return, but rather start editing that other line
        if(e.target.innerText === 'Done') {
            on_edit_done();
            return;
        } else {
            on_edit_done();
        }
    }

    const editable = e.target.parentNode.querySelector('.editable');
    console.log(e.target, editable);
    const editor = e.target.parentNode.querySelector('.editor');
    const ebtn = e.target;

    // make the question editable
    editor.value = editable.innerText;
    editable.classList.add('hidden');
    editor.classList.remove('hidden');
    editor.select();
    ebtn.innerText = 'Done';
    cur_editor = editor;
}

// hide all modals on the screen
function hide_modals() {
    const modals = document.querySelectorAll('.modal');
    for(let i = 0; i < modals.length; ++i) {
        modals[i].classList.add('hidden');
        const modal_content = modals[i].querySelector('.content');
        if(modal_content) {
            modal_content.innerText = '';
        }
    }
}

function show_credentials(data) {
    hide_modals();
    const credentials = document.querySelector('.modal.credentials');
    credentials.classList.remove('hidden');
    const credentials_content = credentials.querySelector('.content')
    if(data.error) {
        credentials_content.innerText = 'Error: ' + data.error;
    } else {
        credentials_content.innerText = 'The quiz url: https://dqueez.com/q/' +
            data.qurl + '\nThe password for editing the quiz is: ' +
            data.password;
    }
}

async function send_quiz() {
    const url = '/api/new';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(cur_json)
        });
        const json = await response.json();
        console.log(json);
        show_credentials(json);
    } catch(error) {
        const data = { error: error.message };
        show_credentials(data);
        console.error(error.message);
    }
}

function on_send_quiz(e) {
    hide_modals();
    send_quiz();
}

function on_cancel_send_quiz(e) {
    hide_modals();
}

async function fetch_quiz() {
    const url = '/api/fetch_quiz';
    try {
        const quiz_password = document.querySelector('.quiz_password');
        const data = {
            password: quiz_password.value
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        console.log(json);
        if(json.qjson) {
            enter_password_div.classList.add('hidden');
            parse_qjson(JSON.parse(json.qjson));
        }
    } catch(error) {
        console.error(error.message);
    }
}

function on_password_entered(e) {
    fetch_quiz();
}

function on_click(e) {
    switch(e.target.dataset.action) {
    case 'add_question': on_add_question(e); break;
    case 'add_option': on_add_option(e); break;
    case 'upload_quiz': on_upload_quiz(e); break;
    case 'edit': on_edit_wording(e); break;
    case 'send_quiz': on_send_quiz(e); break;
    case 'cancel_send_quiz': on_cancel_send_quiz(e); break;
    case 'hide_modals': hide_modals(); break;
    case 'password_entered': on_password_entered(e); break;
    default: on_edit_done(); break;
    }
}

function on_keydown(e) {
    if(cur_editor) {
        if(e.key === 'Enter') {
            on_edit_done();
        }
    }
}

// initialization function
function init() {
    // if the path starts with '/q/' then we are editing an existing quiz,
    // and to continue we need the teacher to enter the password
    const url = window.location.pathname;
    if(url.startsWith('/q/')) {
        enter_password_div.classList.remove('hidden');
    } 
}

init();

window.addEventListener('click', on_click);
window.addEventListener('keydown', on_keydown);


})()
