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

function gen_question_radio(ind, question, points) {
    const div = document.createElement('div');
    div.classList.add('question');
    div.dataset.qtype = 'radio';
    div.dataset.question_ind = ind; // question index in the array from 0 to n
    if(points) { // editable version
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
              <p class="option">
                <span>
                  <input type="radio" name="radio_group_${ind}"
                        value="${question.options[i]}" />
                  <label class="answer editable">${question.options[i]}</label>
                  <input class="editor hidden">
                  <button class="ebtn" data-action="edit">Edit</button>
                </span>
                <span class="side_note">
                  Points: <span
                    class="points editable">${points.options[i][1]}</span>
                  <input type="number" class="editor hidden" />
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
    const div = document.createElement('div');
    div.classList.add('question');
    div.dataset.qtype = 'check';
    div.dataset.question_ind = ind; // question index in the array from 0 to n
    if(points) { // editable version
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
              <p class="option">
                <span>
                  <input type="checkbox" name="radio_group_${ind}"
                        value="${question.options[i]}" />
                  <label class="answer editable">${question.options[i]}</label>
                  <input class="editor hidden">
                  <button class="ebtn" data-action="edit">Edit</button>
                </span>
                <span class="side_note">
                  Points: <span
                    class="points editable">${points.options[i][1]}</span>
                  <input type="number" class="editor hidden" />
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
}

function gen_question_word(ind, question, points) {
}

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
}

function gather_answer_word(question_div) {
}
