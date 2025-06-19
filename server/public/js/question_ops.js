export function gen_questions_div(questions_div, questions, points) {
    questions_div.innerHTML = '';
    for(let i = 0; i < questions.length; ++i) {
        questions_div.append(gen_question(i, questions[i],
            points? points[i]: null));
    }
    if(!points) { // Submit Answers button should only be on the student page
        questions_div.insertAdjacentHTML('beforeend',
        `<button data-action="submit_answers">Submit Answers</button>
        <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>`);
    }
}

export function gen_question(ind, question, points) {
    if(!question) return; // nothing provided
    switch(question.qtype) {
        case 'radio': return gen_question_radio(ind, question, points);
        case 'check': return gen_question_check(ind, question, points);
        case 'number': return gen_question_number(ind, question, points);
        case 'word': return gen_question_word(ind, question, points);
        default: console.error(
                `Error: question type ${question.qtype} unknown!`);
            return null;
    }
}

export function append_new_question(questions_div, questions, points) {
    questions.push({
              "qtype": "radio",
              "image": "/img/placeholder.webp",
              "question": "What will the question be?",
              "options": [
                "Yes",
                "No"
              ]
            });
    points.push({
              "options": [
                [
                  "Yes",
                  "1"
                ],
                [
                  "No",
                  "0"
                ]
              ]
            });
    gen_questions_div(questions_div, questions, points);
}

export function gather_answers(questions_div) {
    const all_questions = questions_div.querySelectorAll('.question');
    const answers = [];
    all_questions.forEach(question_div => {
        answers.push(gather_answer(question_div));
    });
    return answers;
}

export function gather_answer(question_div) {
    switch(question_div.dataset.qtype) {
    case 'radio': return gather_answer_radio(question_div);
    case 'check': return gather_answer_check(question_div);
    case 'number': return gather_answer_number(question_div);
    case 'word': return gather_answer_word(question_div);
    default: console.error(
            `Error: cannot read answers for unknown question type
                ${question_div.dataset.qtype}!`);
            return null;
    }
}

function mk_qtype_selector(qtype) {
    const radio_selected = qtype === 'radio'? ` selected="selected" `: ``;
    const check_selected = qtype === 'check'? ` selected="selected" `: ``;
    const number_selected = qtype === 'number'? ` selected="selected" `: ``;
    const word_selected = qtype === 'word'? ` selected="selected" `: ``;
    return `
            <div class="qtype_sel_wrap">
                <label>Choose an answer type: </label>
                <select data-action="change_qtype" class="qtype_sel">
                    <option value="radio" ${radio_selected}>Radio</option>
                    <option value="check" ${check_selected}>Checkboxes</option>
                    <option value="number" ${number_selected}>Number</option>
                    <option value="word" ${word_selected}>Word</option>
                </select>
            </div>
`;
}

//functions to generate different question types

function gen_question_radio(ind, question, points) {
    const qtype = 'radio';
    const div = document.createElement('div');
    div.classList.add('question');
    div.dataset.qtype = qtype;
    div.dataset.question_ind = ind; // question index in the array from 0 to n
    if(points) { // editable version
        let html = `
            <div class="image">
                <img src="/img/placeholder.webp" />
            </div>
            <div class="text">
              <h2><span class="qwording editable">${question.question}</span>
                <input class="editor hidden" data-field="question" />
                <button class="ebtn"
                    data-action="edit">Edit</button>
                <button data-action="remove_question">Remove Question</button>
              </h2>
        ` + mk_qtype_selector(qtype);
        for(let i = 0; i < question.options.length; ++i) {
            html += `
              <p class="option" data-option_ind="${i}">
                <span>
                  <input type="radio" name="radio_group_${ind}"
                        value="${question.options[i]}" />
                  <label class="answer editable">${question.options[i]}</label>
                  <input class="editor hidden" data-field="option">
                  <button class="ebtn" data-action="edit">Edit</button>
                </span>
                <span class="side_note">
                  Points: <span
                    class="points editable">${points.options[i][1]}</span>
                  <input type="number" data-field="points"
                        class="editor hidden" />
                  <button class="ebtn" data-action="edit">Edit</button>
                  <button data-action="remove_option">Remove</button>
                </span>
              </p>
            `;
        }
        html += `
             <button data-action="add_option">Add an Answer Option</button>
            </div>
        `;
        div.innerHTML = html;
    } else { // student version
        let html = `
            <div class="image">
                <img src="/img/placeholder.webp" />
            </div>
            <div class="text">
              <h2><span class="qwording">${question.question}</span>
              </h2>
        `;
        for(let i = 0; i < question.options.length; ++i) {
            html += `
              <p class="option">
                <span>
                  <input type="radio" name="radio_group_${ind}"
                        value="${question.options[i]}" />
                  <label class="answer">${question.options[i]}</label>
                </span>
              </p>
            `;
        }
        html += `
            </div>
        `;
        div.innerHTML = html;
    }
    return div;
}

function gen_question_check(ind, question, points) {
    const qtype = 'check';
    const div = document.createElement('div');
    div.classList.add('question');
    div.dataset.qtype = qtype;
    div.dataset.question_ind = ind; // question index in the array from 0 to n
    if(points) { // editable version
        let html = `
            <div class="image">
                <img src="/img/placeholder.webp" />
            </div>
            <div class="text">
              <h2><span class="qwording editable">${question.question}</span>
                <input class="editor hidden" data-field="question" />
                <button class="ebtn"
                    data-action="edit">Edit</button>
                <button data-action="remove_question">Remove Question</button>
              </h2>
        ` + mk_qtype_selector(qtype);
        for(let i = 0; i < question.options.length; ++i) {
            html += `
              <p class="option" data-option_ind="${i}">
                <span>
                  <input type="checkbox" name="radio_group_${ind}"
                        value="${question.options[i]}" />
                  <label class="answer editable">${question.options[i]}</label>
                  <input class="editor hidden" data-field="option">
                  <button class="ebtn" data-action="edit">Edit</button>
                </span>
                <span class="side_note">
                  Points: <span class="points editable">${points.answer ?? 1}</span>
                  <input type="number" data-field="points" class="editor hidden" />
                  <button class="ebtn" data-action="edit">Edit</button>
                </span>
              </p>
            `;
        }
        html += `
             <button data-action="add_option">Add an Answer Option</button>
            </div>
        `;
        div.innerHTML = html;
    } else { // student version
        let html = `
            <div class="image">
                <img src="/img/placeholder.webp" />
            </div>
            <div class="text">
              <h2><span class="qwording">${question.question}</span>
              </h2>
        `;
        for(let i = 0; i < question.options.length; ++i) {
            html += `
              <p class="option">
                <span>
                  <input type="checkbox" value="${question.options[i]}" />
                  <label class="answer">${question.options[i]}</label>
                </span>
              </p>
            `;
        }
        html += `
            </div>
        `;
        div.innerHTML = html;
    }
    return div;
}

function gen_question_number(ind, question, points) {
    const qtype = 'number';
    const div = document.createElement('div');
    div.classList.add('question');
    div.dataset.qtype = qtype;
    div.dataset.question_ind = ind;

    if (points) { // editable version
        let html = `
            <div class="image">
                <img src="/img/placeholder.webp" />
            </div>
            <div class="text">
              <h2>
                <span class="qwording editable">${question.question}</span>
                <input class="editor hidden" data-field="question" />
                <button class="ebtn" data-action="edit">Edit</button>
                <button data-action="remove_question">Remove Question</button>
              </h2>
              ${mk_qtype_selector(qtype)}
              <p class="option" data-option_ind="0">
                <span>
                  <label>Answer: </label>
                  <input type="number" value="${question.answer}" disabled />
                  <input class="editor hidden" type="number" data-field="answer" step="any" />
                  <button class="ebtn" data-action="edit">Edit</button>
                </span> 
                <span class="side_note">
                  Points: <span class="points editable">${points.answer ?? 1}</span>
                  <input type="number" data-field="points" class="editor hidden" />
                  <button class="ebtn" data-action="edit">Edit</button>
                </span>
              </p>
            </div>
        `;
        div.innerHTML = html;
    } else { // student version
        let html = `
            <div class="image">
                <img src="/img/placeholder.webp" />
            </div>
            <div class="text">
              <h2><span class="qwording">${question.question}</span></h2>
              <p class="option">
                <label>Answer: </label>
                <input type="number" name="number_answer_${ind}" />
              </p>
            </div>
        `;
        div.innerHTML = html;
    }

    return div;
}

 

function gen_question_word(ind, question, points) {
    const qtype = 'word';
    const div = document.createElement('div');
    div.classList.add('question');
    div.dataset.qtype = qtype;
    div.dataset.question_ind = ind;

    const keywords = points?.keywords || [];

    const keywordInputs = keywords.map((kw, i) => `
        <p class="keyword" data-keyword_ind="${i}">
            <input type="text" class="keyword_input" data-field="keyword" value="${kw[0]}" />
            <label>Points:</label>
            <input type="number" class="points_input" data-field="keyword_point" value="${kw[1]}" />
            <button class="ebtn" data-action="remove_keyword">Remove</button>
        </p>
    `).join('');

    const keywordSection = points ? `
        <div class="keyword_section">
            <label><strong>Important Keywords:</strong></label>
            ${keywordInputs}
            <button data-action="add_keyword">Add Keyword</button>
        </div>
        <br>
        <span class="side_note">
            <em>Note: Student answers will be initially auto-scored based on keywords, then manually reviewed.</em>
        </span>
    ` : '';

    const html = `
        <div class="image">
            <img src="/img/placeholder.webp" />
        </div>
        <div class="text">
            <h2>
                <span class="qwording ${points ? 'editable' : ''}">${question.question}</span>
                ${points ? `<input class="editor hidden" data-field="question" />` : ''}
                ${points ? `
                    <button class="ebtn" data-action="edit">Edit</button>
                    <button data-action="remove_question">Remove Question</button>
                ` : ''}
            </h2>
            ${points ? mk_qtype_selector(qtype) : ''}
            ${points ? keywordSection : `
                <p class="option">
                    <input type="text" class="student_answer" placeholder="Type your answer here..." />
                </p>
            `}
        </div>
    `;

    div.innerHTML = html;
    return div;
}


// -----gather answers for each type

function gather_answer_radio(question_div) {
    console.log('gathering answer radio');
    const result = {
        isset: false,
        val: null
    }
    const radio = question_div.querySelector(`input:checked`);
    if(radio) {
        result.isset = true;
        result.val = radio.value;
    }
    return result;
}

function gather_answer_check(question_div) {
    console.log('gathering answer check');
    const result = {
        isset: false,
        val: []
    }
    const checks = question_div.querySelectorAll(`input`);
    checks.forEach(check => {
        if(check.checked) {
            result.isset = true;
            result.val.push(check.value);
        }
    });
    return result;
}

function gather_answer_number(question_div) {
    console.log('gathering answer number');
    const result = {
        isset: false,
        val: null
    };
    const input = question_div.querySelector('input[type="number"]');
    if (input && input.value.trim() !== '') {
        result.isset = true;
        result.val = input.value.trim();
    }
    return result;
}


function gather_answer_word(question_div) {
    console.log('gathering answer word');
    const result = {
        isset: false,
        val: null
    };
    const input = question_div.querySelector('.student_answer');
    if (input && input.value.trim() !== '') {
        result.isset = true;
        result.val = input.value.trim();
    }
    return result;
}
