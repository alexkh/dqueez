'use strict';
(function() {

const exam_setup = document.querySelector('.exam_setup');
const questions_section = document.querySelector('.questions_section');
const questions_div = document.querySelector('.questions');
const add_question_btn = document.querySelector('.add_question_btn');
const student_login = document.querySelector('.student_login');

let current_exam = null;
let cur_editor = null;
let is_student_mode = false;
let lastSelectedRadio = null; // Track the last selected radio button

// Radio button deselection handler
function handleRadioClick(e) {
    const radio = e.target;
    if (radio === lastSelectedRadio) {
        // Clicking the currently selected radio - deselect it
        setTimeout(() => {
            radio.checked = false;
            lastSelectedRadio = null;
        }, 0);
    } else {
        lastSelectedRadio = radio;
    }
}

// Initialize radio buttons with deselection functionality
function initRadioButtons() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        // Only add listener if not already added
        if (!radio.hasListener) {
            // Ensure radio has a group name if not already set
            if (!radio.name) {
                const questionDiv = radio.closest('.question');
                if (questionDiv) {
                    const index = questionDiv.dataset.questionIndex || Date.now();
                    radio.name = `question_${index}`;
                } else {
                    radio.name = `radio_group_${Date.now()}`;
                }
            }
            radio.addEventListener('click', handleRadioClick);
            radio.hasListener = true; // Mark as having listener
        }
    });
}

// Setup exam with details
function on_setup_exam() {
    const name = document.querySelector('.exam_name').value.trim();
    const start = document.querySelector('.exam_start').value;
    const end = document.querySelector('.exam_end').value;
    const student_ids = document.querySelector('.student_ids').value.split('\n').filter(id => id.trim());
    
    if (!name || !start || !end || student_ids.length === 0) {
        alert('Please fill all fields and add at least one student ID');
        return;
    }
    
    current_exam = {
        name: name,
        start: start,
        end: end,
        students: student_ids.map(id => id.trim()),
        questions: [],
        points: []
    };
    
    // Hide setup form, show questions section
    exam_setup.classList.add('hidden');
    questions_section.classList.remove('hidden');
    
    alert('Exam setup complete! Now add your questions.');
}

// Add question (with radio button deselection)
function on_add_question() {
    let div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = `
        <div class="image">
            <img src="/img/placeholder.webp" />
        </div>
        <div class="text">
          <h2><span class="qwording editable">What will the question be?</span>
            <input class="editor hidden" />
            <button class="ebtn" data-action="edit">Edit</button>
          </h2>
          <p class="option">
            <span>
              <input type="radio" name="radio_group_${Date.now()}" value="Yes" />
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
              <input type="radio" name="radio_group_${Date.now()}" value="No" />
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
    initRadioButtons(); // Initialize radio buttons for this new question
}

// Add option to existing question (with radio button deselection)
function on_add_option(e) {
    const btn = e.target;
    const parent_node = btn.parentNode;
    const node = document.createElement('p');
    node.classList.add('option');
    const questionDiv = btn.closest('.question');
    const radioGroupName = questionDiv.querySelector('input[type="radio"]').name;
    
    node.innerHTML = `
        <span>
          <input type="radio" name="${radioGroupName}" value="Sometimes" />
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
    initRadioButtons(); // Initialize radio buttons for this new option
}

// Edit functionality
function on_edit_wording(e) {
    if(cur_editor) {
        if(e.target.innerText === 'Done') {
            on_edit_done();
            return;
        } else {
            on_edit_done();
        }
    }

    const editable = e.target.parentNode.querySelector('.editable');
    const editor = e.target.parentNode.querySelector('.editor');
    const ebtn = e.target;

    editor.value = editable.innerText;
    editable.classList.add('hidden');
    editor.classList.remove('hidden');
    editor.select();
    ebtn.innerText = 'Done';
    cur_editor = editor;
}

function on_edit_done() {
    if(!cur_editor) return;
    
    const editable = cur_editor.parentNode.querySelector('.editable');
    const editor = cur_editor.parentNode.querySelector('.editor');
    const ebtn = cur_editor.parentNode.querySelector('.ebtn');

    editable.innerText = editor.value;
    editable.classList.remove('hidden');
    editor.classList.add('hidden');
    ebtn.innerText = 'Edit';
    cur_editor = null;
}

// Finalize exam
function on_finalize_exam() {
    const questions = questions_div.querySelectorAll('.question');
    if (questions.length === 0) {
        alert('Please add at least one question');
        return;
    }
    
    // Collect all questions and points
    current_exam.questions = [];
    current_exam.points = [];
    
    for(let i = 0; i < questions.length; i++) {
        const qwording = questions[i].querySelector('.qwording').innerText;
        const q = {
            qtype: 'radio',
            image: '',
            question: qwording,
            options: []
        };
        const p = { options: [] };
        
        const options = questions[i].querySelectorAll('.option');
        for(let j = 0; j < options.length; j++) {
            const option = options[j].querySelector('.answer').innerText;
            const points = options[j].querySelector('.points').innerText;
            q.options.push(option);
            p.options.push([option, points]);
        }
        current_exam.questions.push(q);
        current_exam.points.push(p);
    }
    
    // Send to server
    send_exam_to_server();
}

// Send exam to server
function send_exam_to_server() {
    fetch('/api/create_exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current_exam)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            show_exam_urls(data.student_urls);
        } else {
            alert('Error creating exam: ' + data.error);
        }
    })
    .catch(error => {
        alert('Error: ' + error.message);
        console.error(error);
    });
}

// Show student URLs
function show_exam_urls(student_urls) {
    const modal = document.querySelector('.modal.credentials');
    const content = modal.querySelector('.content');
    
    let html = '<h4>Send these URLs to your students:</h4><ul>';
    student_urls.forEach(item => {
        html += `<li><strong>${item.student_id}:</strong> <a href="${item.url}" target="_blank">${item.url}</a></li>`;
    });
    html += '</ul>';
    
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

// Student verification (for when students access exam URLs)
function check_student_access() {
    const url = window.location.pathname;
    if (url.startsWith('/exam/')) {
        is_student_mode = true;
        document.querySelector('.home').classList.add('hidden');
        exam_setup.classList.add('hidden');
        questions_section.classList.add('hidden');
        student_login.classList.remove('hidden');
    }
}

function on_verify_student() {
    const student_id = document.querySelector('.student_id_input').value.trim();
    
    if (!student_id) {
        alert('Please enter your Student ID');
        return;
    }
    
    fetch('/api/verify_student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            student_id: student_id,
            exam_url: window.location.pathname
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            start_student_exam(data.exam_data);
        } else {
            alert('Access denied: ' + data.error);
        }
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
}

function start_student_exam(exam_data) {
    // Check time constraints
    const now = new Date();
    const start_time = new Date(exam_data.start);
    const end_time = new Date(exam_data.end);
    
    if (now < start_time) {
        alert('Exam has not started yet');
        return;
    }
    if (now > end_time) {
        alert('Exam time has expired');
        return;
    }
    
    // Hide login, show exam
    student_login.classList.add('hidden');
    questions_div.classList.remove('hidden');
    
    // Load questions for student
    load_questions_for_student(exam_data);
    
    // Add submit button
    const submit_btn = document.createElement('button');
    submit_btn.textContent = 'Submit Exam';
    submit_btn.dataset.action = 'submit_exam';
    submit_btn.style.fontSize = '18px';
    submit_btn.style.padding = '10px 20px';
    document.body.appendChild(submit_btn);
    
    // Show timer
    show_timer(end_time);
    
    // Initialize radio buttons for student exam
    initRadioButtons();
}

function load_questions_for_student(exam_data) {
    for(let i = 0; i < exam_data.questions.length; i++) {
        add_question_for_student(exam_data.questions[i], i);
    }
}

function add_question_for_student(question, index) {
    let div = document.createElement('div');
    div.classList.add('question');
    div.dataset.questionIndex = index;
    
    let html = `
        <div class="image">
            <img src="/img/placeholder.webp" />
        </div>
        <div class="text">
          <h2>${question.question}</h2>
    `;
    
    for(let i = 0; i < question.options.length; i++) {
        html += `
          <p>
            <input type="radio" name="question_${index}" value="${question.options[i]}" />
            <label>${question.options[i]}</label>
          </p>
        `;
    }
    
    html += `</div>`;
    div.innerHTML = html;
    questions_div.appendChild(div);
}

function show_timer(end_time) {
    const timer = document.createElement('div');
    timer.style.position = 'fixed';
    timer.style.top = '10px';
    timer.style.right = '10px';
    timer.style.background = '#ffeb3b';
    timer.style.padding = '10px';
    timer.style.border = '2px solid #f57f17';
    timer.style.fontSize = '16px';
    timer.style.fontWeight = 'bold';
    document.body.appendChild(timer);
    
    const updateTimer = () => {
        const remaining = end_time - new Date();
        if (remaining <= 0) {
            timer.textContent = 'Time\'s up!';
            submit_exam_automatically();
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timer.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    };
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

function on_submit_exam() {
    const answers = [];
    const questions = questions_div.querySelectorAll('.question');
    
    questions.forEach((q, index) => {
        const selected = q.querySelector('input[type="radio"]:checked');
        answers.push({
            question_index: index,
            answer: selected ? selected.value : null
        });
    });
    
    fetch('/api/submit_exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            student_id: document.querySelector('.student_id_input').value,
            exam_url: window.location.pathname,
            answers: answers
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(`Exam submitted successfully! Your score: ${data.score}`);
        document.querySelectorAll('input').forEach(input => input.disabled = true);
    })
    .catch(error => {
        alert('Error submitting exam: ' + error.message);
    });
}

function submit_exam_automatically() {
    alert('Time expired! Submitting automatically...');
    on_submit_exam();
}

function hide_modals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.add('hidden'));
}

// Click event handler
function on_click(e) {
    switch(e.target.dataset.action) {
        case 'setup_exam': on_setup_exam(); break;
        case 'add_question': on_add_question(); break;
        case 'add_option': on_add_option(e); break;
        case 'edit': on_edit_wording(e); break;
        case 'finalize_exam': on_finalize_exam(); break;
        case 'verify_student': on_verify_student(); break;
        case 'submit_exam': on_submit_exam(); break;
        case 'hide_modals': hide_modals(); break;
        default: on_edit_done(); break;
    }
}

function on_keydown(e) {
    if(cur_editor && e.key === 'Enter') {
        on_edit_done();
    }
}

// Initialize
function init() {
    check_student_access();
    initRadioButtons(); // Initialize any existing radio buttons on page load
}

init();
window.addEventListener('click', on_click);
window.addEventListener('keydown', on_keydown);

})();