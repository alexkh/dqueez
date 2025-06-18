import { gen_questions_div, gather_answers } from './question_ops.js';

(function() {

const enter_student_id_div = document.querySelector('.enter_student_id');
const questions_div = document.querySelector('.questions');
let questions = null;

function parse_questions() {
    console.log('parsing questions: ', JSON.stringify(questions));
    gen_questions_div(questions_div, questions, false);
}

async function upload_answers() {
    const answers = gather_answers(questions_div);
    console.log('answers gathered:', answers);
    const url = '/api/upload_answers';
    try {
        const data = {
            student_id: document.querySelector('.student_id').value,
            answers: answers
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        console.log(json);
        showAnswerModal();

    } catch(error) {
        console.error(error.message);
    }
}

function on_submit_answers(e) {
    upload_answers();
}

async function fetch_quiz() {
    const url = '/api/fetch_questions';
//    try {
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
            questions = json.qjson.questions;
            parse_questions();
        }
/*    } catch(error) {
        console.error(error.message);
    }
*/
}

async function on_student_id_entered(e) {
    const fetch_result = await fetch_quiz();
}

function on_click(e) {
    switch(e.target.dataset.action) {
    case 'student_id_entered': on_student_id_entered(e); break;
    case 'submit_answers': on_submit_answers(e); break;
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
function showAnswerModal() {
    const modal = document.getElementById("answerModal");
    modal.classList.remove("hidden");

    document.getElementById("closeAnswerModal").onclick = () => {
        modal.classList.add("hidden");
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    };
}

