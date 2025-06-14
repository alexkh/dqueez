'use strict';
(function() {

const enter_student_id_div = document.querySelector('.enter_student_id');

function parse_questions(questions) {
    console.log('parsing questions: ', JSON.stringify(questions));
}

async function fetch_quiz() {
    const url = '/api/fetch_questions';
    try {
        const student_id = document.querySelector('.student_id').value;
        const data = {
            student_id
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
        if(json && json.qjson && json.qjson.questions) {
            // successfully loaded questions
            parse_questions(json.qjson.questions);
        }
    } catch(error) {
        console.error(error.message);
    }
}

async function on_student_id_entered(e) {
    const fetch_result = await fetch_quiz();
}

function on_click(e) {
    switch(e.target.dataset.action) {
    case 'student_id_entered': on_student_id_entered(e); break;
    default: break;
    }
}

function on_keydown(e) {
    if(e.key === 'Enter') {
        if(e.target.classList.contains('student_id')) {
            on_student_id_entered(e);
            return;
        }
    }
}

// initialization function
function init() {

}

init();

window.addEventListener('click', on_click);
window.addEventListener('keydown', on_keydown);

})();
