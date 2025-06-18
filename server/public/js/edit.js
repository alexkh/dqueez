import { gen_questions_div, append_new_question } from './question_ops.js';

(function() {

const questions_div = document.querySelector('.questions');
const add_question_btn = document.querySelector('.add_question_btn');
const upload_quiz_btn = document.querySelector('.upload_quiz_btn');
const enter_password_div = document.querySelector('.enter_password');
const exam_setup_div = document.querySelector('.exam_setup');
const exam_select = document.querySelector('.exam_select');
const estart_input = document.querySelector('.exam_start');
const efinish_input = document.querySelector('.exam_end');
const eduration_input = document.querySelector('.exam_duration_minutes');
const inputs_table = document.querySelector('.inputs_table');
const estudents_input = document.querySelector('.student_ids');
let old_exam_select_value = null; // if exam_select changes - update exam view
let cur_editor = null; // input, currently active
let cur_json = null; // json that will be sent to the server
let credentials = null; // these are required to edit an existing quiz
let all_exams = null; // raw exams information from the database
let all_inputs = null; // all inputs linked to this quiz
let lastSelectedRadio = null; // Track the last selected radio button

function updateRemoveButtonsForQuestion(questionDiv) {
    const options = questionDiv.querySelectorAll('.option');
    const showRemove = options.length > 2;
    options.forEach(option => {
        const removeBtn = option.querySelector('[data-action="remove_option"]');
        if (removeBtn) {
            removeBtn.style.display = showRemove ? 'inline-block' : 'none';
        }
    });
}

//function to add questions
function on_add_question(e) {
    append_new_question(questions_div, cur_json.questions, cur_json.points);
}

function on_remove_question(e) {
    const question_div = e.target.closest('.question');
    const ind = 1 * question_div.dataset.question_ind; // index in qjson array
    cur_json.questions.splice(ind, 1);
    cur_json.points.splice(ind, 1);
    // reload questions from cur_json and re-index all questions in the process
    gen_questions_div(questions_div, cur_json.questions, cur_json.points);
}

// append a new option for an existing answer
function on_add_option(e) {
    const question_div = e.target.closest('.question');
    const ind = 1 * question_div.dataset.question_ind; // index in qjson array
    const qtype = question_div.dataset.qtype;
    cur_json.questions[ind].options.push('Sometimes');
    cur_json.points[ind].options.push(['Sometimes', '0']);
    // reload questions from cur_json
    gen_questions_div(questions_div, cur_json.questions, cur_json.points);
}

function on_remove_option(e) {
    const question_div = e.target.closest('.question');
    const ind = 1 * question_div.dataset.question_ind; // index in qjson array
    const qtype = question_div.dataset.qtype;

    const option_div = e.target.closest('.option');
    console.log(`option_div = `, option_div);
    const option_ind = 1 * option_div.dataset.option_ind;
    console.log(`removing option ${option_ind} from question ${ind}`);
    cur_json.questions[ind].options.splice(option_ind, 1);
    cur_json.points[ind].options.splice(option_ind, 1);
    // reload questions from cur_json
    gen_questions_div(questions_div, cur_json.questions, cur_json.points);
}

function parse_qjson(qjson) {
    console.log('parsing qjson', qjson);
    if(!qjson.questions || !qjson.points || qjson.questions.length < 1 ||
            qjson.points.length !== qjson.questions.length) {
        console.error('invalid quiz data received from the server');
        return;
    }

    gen_questions_div(questions_div, qjson.questions, qjson.points);
}

function on_upload_quiz() {
    // Check if there are no questions
    if (cur_json.questions.length === 0) {
        alert("Error: You must add at least one question before uploading.");
        return; // Exit the function without proceeding
    }

    const preview = document.querySelector('.modal.json_preview');
    const preview_content = preview.querySelector('.content')
    console.log(preview_content);
    preview_content.innerText = JSON.stringify(cur_json, null, 2);
    preview.classList.remove('hidden');
}

function on_edit_done() {
    if(!cur_editor) {
        return;
    }

    const editable = cur_editor.parentNode.querySelector('.editable');
    const editor = cur_editor.parentNode.querySelector('.editor');
    const ebtn = cur_editor.parentNode.querySelector('.ebtn');

    const question_div = cur_editor.closest('.question');
    const ind = 1 * question_div.dataset.question_ind; // index in qjson array
    const qtype = question_div.dataset.qtype;

    console.log('data-field: ', editor.dataset.field);
    if(editor.dataset.field === 'question') {
        cur_json.questions[ind].question = editor.value;
    } else {
        const option_div = cur_editor.closest('.option');
        const option_ind = 1 * option_div.dataset.option_ind;
        if(editor.dataset.field === 'option') {
            cur_json.questions[ind].options[option_ind] = editor.value;
            cur_json.points[ind].options[option_ind][0] = editor.value;
        } else if(editor.dataset.field === 'points') {
            cur_json.points[ind].options[option_ind][1] = editor.value;
        }
    }
    cur_editor = null;
    // reload questions from cur_json
    gen_questions_div(questions_div, cur_json.questions, cur_json.points);
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

function show_credentials(error) {
    hide_modals();
    const credentials_div = document.querySelector('.modal.credentials');
    credentials_div.classList.remove('hidden');
    const credentials_content = credentials_div.querySelector('.content')
    if(error && error.error) {
        credentials_content.innerText = 'Error: ' + error.error;
    } else {
        credentials_content.innerHTML = `The quiz url:
            <a href="https://dqueez.com/q/${credentials.qurl}">
            https://dqueez.com/q/${credentials.qurl}</a>
            <br>
            <details>
              <summary>Click to see the password for editing this quiz
              </summary>
              <p>${credentials.password}</p>
            </details>
            <button data-action="copy_credentials">Copy to Clipboard</button>`;
    }
}

// send new quiz to the database
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
        credentials = {
            qurl: json.qurl,
            password: json.password
        }
        show_credentials();
    } catch(error) {
        const data = { error: error.message };
        show_credentials(data);
        console.error(error.message);
    }
}

// send modified version of the quiz to the database
async function send_q_modify() {
    const url = '/api/q/modify';
    try {
        const data = {
                password: credentials.password,
                qjson: JSON.stringify(cur_json)
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        //TODO; create a proper modal for status messages
        alert('Modified quiz successfully saved to the database!');
    } catch(error) {
        const data = { error: error.message };
        //TODO; create a proper modal for status messages
        alert('Error saving the updated quiz:', error.message);
        console.error(error.message);
    }
}

function on_send_quiz(e) {
    hide_modals();
    if(credentials === null || !credentials.password) {
        send_quiz();
    } else {
        send_q_modify();
    }
}

function on_cancel_send_quiz(e) {
    hide_modals();
}

async function fetch_exams() {
    const url = '/api/fetch_exams';
    try {
        const quiz_password = document.querySelector('.quiz_password');
        const data = {
            password: credentials?.password || quiz_password.value
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
            // successfully loaded a quiz, which means that credentials are good
            const url = window.location.pathname; // we extract qurl from url
            if(!credentials) {
                credentials = {
                    qurl: url.split("/")[2],
                    password: quiz_password.value
                }
                enter_password_div.classList.add('hidden');
                quiz_password.value = '';
            }
            parse_qjson(JSON.parse(json.qjson));
            all_exams = json.exams;
            all_inputs = json.inputs;
            parse_exams();
            add_question_btn.classList.remove('hidden');
            exam_setup_div.classList.remove('hidden');
        }
    } catch(error) {
        console.error(error.message);
    }
}

function parse_exams() {
    console.log('parsing exams...', all_exams, all_inputs);
    exam_select.innerHTML = '';
    for(let i = 0; i < all_exams.length; ++i) {
        let option = document.createElement('option');
        option.value = all_exams[i].eurl;
        option.textContent = all_exams[i].eurl;
        exam_select.appendChild(option);
    }
    let option = document.createElement('option');
    option.value = 'create_new_exam';
    option.textContent = 'Create New Exam';
    exam_select.appendChild(option);
    on_exam_selected();
}

function on_exam_selected() {
    console.log('selected exam is:', exam_select.value);
    let exam_ind = null;
    for(let i = 0; i < all_exams.length; ++i) {
        console.log(`'${all_exams[i].eurl}' === '${exam_select.value}'`);
        if(all_exams[i].eurl === exam_select.value) {
            console.log('... yes!');
            exam_ind = i;
            break;
        }
    }
    if(exam_ind === null) {
        // creating new exam so reset all the values
        estart_input.value = '';
        efinish_input.value = '';
        eduration_input.value = 20;
        inputs_table.innerHTML = '';
        estudents_input.value = '';
        return;
    }
    let st = new Date(all_exams[exam_ind].estart).toISOString().slice(0, 16);
    let fin = new Date(all_exams[exam_ind].estart).toISOString().slice(0, 16);
    estart_input.value = st;
    efinish_input.value = fin;
    eduration_input.value = Math.floor(
        all_exams[exam_ind].etime_limit_seconds / 60);
    estudents_input.value = '';
    // fill out the inputs table
    inputs_table.innerHTML = `<div class="thead">Student&nbsp;Id</div>
        <div class="thead">Student Exam Url</div>
        <div class="thead">Student's Answers</div>`;
    const ieid = all_exams[exam_ind].eid;
    for(let i = 0; i < all_inputs.length; ++i) {
        // all_inputs contain inputs for all exam, so we need to filter by ieid
        if(all_inputs[i].ieid !== ieid) {
            continue
        }
        const id_div = document.createElement('div');
        id_div.innerText = all_inputs[i].istudent_id;
        id_div.classList.add('left_col');
        const iurl_div = document.createElement('a');
        iurl_div.href = 'https://dqueez.com/' + all_inputs[i].iurl;
        iurl_div.innerText = 'https://dqueez.com/' + all_inputs[i].iurl;
        const ijson_div = document.createElement('div');
        ijson_div.innerText = all_inputs[i].ijson; // .replace(/\\/g, "");

        inputs_table.appendChild(id_div);
        inputs_table.appendChild(iurl_div);
        inputs_table.appendChild(ijson_div);
    }
    console.log('start, finish:', st, fin);
}

function on_exam_select_change(e) {
    console.log('Exam Select changed from ', old_exam_select_value,
        ' to ', exam_select.value);
    if(old_exam_select_value === exam_select.value) {
        return; // no change, it could be just clicked - no need to update view
    }
    old_exam_select_value = exam_select.value;
    on_exam_selected();
}

function on_password_entered(e) {
    fetch_exams();
}

function on_copy_credentials(e) {
    const inp = document.createElement('input');
    document.body.appendChild(inp);
    inp.value = `Quiz: https://dqueez.com/q/${credentials.qurl}
 Password: ${credentials.password}`;
    inp.select();
    document.execCommand('copy', false);
    inp.remove();
}

// 'Schedule Exam' button clicked
async function on_schedule_exam(e) {
    // are we modifying existing or creating a new exam?
    const url = exam_select.value === 'create_new_exam'? '/api/e/create':
        '/api/e/modify';
    try {
        const data = {
            password: credentials.password,
            eurl: exam_select.value,
            estart: estart_input.value,
            efinish: efinish_input.value,
            etime_limit_seconds: Math.floor(60 * eduration_input.value),
            estudents: estudents_input.value
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
        if(json.exam.eurl) {
            console.log('Exam created. Refreshing the view');
            fetch_exams();
        };
    } catch(error) {
        console.error(error.message);
    }
}

function on_change_qtype(e) {
    const question_div = e.target.closest('.question');
    const ind = 1 * question_div.dataset.question_ind; // index in qjson array
    const qtype0 = question_div.dataset.qtype; // change from this qtype
    const qtype1 = e.target.value; // change to this qtype
    console.log(`changing qtype from _${qtype0}_ to _${qtype1}_`);
    if((qtype0 === 'radio' && qtype1 === 'check') ||
            (qtype0 === 'check' && qtype1 === 'radio')) {
        console.log(`changing qtype from ${qtype0} to ${qtype1}`);
        // between radio and check the change is trivial. only the qtype changes
        // in qjson
        cur_json.questions[ind].qtype = qtype1;
    } else {
        // it might be required to change this for some other qtypes
        cur_json.questions[ind].qtype = qtype1;
    }
    // reload questions from cur_json
    gen_questions_div(questions_div, cur_json.questions, cur_json.points);
}

function on_click(e) {
    switch(e.target.dataset.action) {
    case 'add_question': on_add_question(e); break;
    case 'remove_question': on_remove_question(e); break;
    case 'add_option': on_add_option(e); break;
    case 'remove_option': on_remove_option(e); break;
    case 'upload_quiz': on_upload_quiz(e); break;
    case 'edit': on_edit_wording(e); break;
    case 'send_quiz': on_send_quiz(e); break;
    case 'cancel_send_quiz': on_cancel_send_quiz(e); break;
    case 'hide_modals': hide_modals(); break;
    case 'password_entered': on_password_entered(e); break;
    case 'copy_credentials': on_copy_credentials(e); break;
    case 'schedule_exam': on_schedule_exam(e); break;
    case 'change_qtype': on_change_qtype(e); break;
    default: on_edit_done(); break;
    }
}

function on_keydown(e) {
    if(cur_editor) {
        if(e.key === 'Enter') {
            on_edit_done();
            return;
        }
    } else {
        if(e.key === 'Enter') {
            console.log(e.target);
            if(e.target.classList.contains('quiz_password')) {
                on_password_entered(e);
                return;
            }
        }
    }
}

// initialization function
function init() {
    // if the path starts with '/q/' then we are editing an existing quiz,
    // and to continue we need the teacher to enter the password
    const url = window.location.pathname;
    const qurl = url.split("/")[2]
    const h1_word = document.querySelector('.h1_word');
    const h1_qurl = document.querySelector('.h1_qurl');
    if(url.startsWith('/q/')) {
        h1_word.innerText = 'Edit';
        h1_qurl.innerText = qurl;
        enter_password_div.classList.remove('hidden');
        add_question_btn.classList.add('hidden');
    } else {
        h1_word.innerText = 'Create';
        cur_json = {
            "questions": [],
            "points": []
        }
        append_new_question(questions_div, cur_json.questions, cur_json.points);
    }
}

init();

window.addEventListener('click', on_click);
window.addEventListener('keydown', on_keydown);
exam_select.onchange = on_exam_select_change;

})();
