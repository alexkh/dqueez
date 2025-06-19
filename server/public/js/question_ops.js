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
    div.dataset.question_ind = ind;

    if (points) { // Editable (teacher) version
        // Ensure points.options exists and is initialized properly
        if (!points.options || !Array.isArray(points.options)) {
            points.options = question.options.map((opt, i) => [opt, i === 0 ? 1 : 0]);
        }

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
        `;

        for (let i = 0; i < question.options.length; ++i) {
            const optionText = question.options[i];
            const optionPoints = points.options[i]?.[1] ?? (i === 0 ? 1 : 0);

            // Ensure option points structure is valid
            points.options[i] = [optionText, optionPoints];

            html += `
              <p class="option" data-option_ind="${i}">
                <span>
                  <input type="checkbox" name="check_group_${ind}"
                        value="${optionText}" />
                  <label class="answer editable">${optionText}</label>
                  <input class="editor hidden" data-field="option" />
                  <button class="ebtn" data-action="edit">Edit</button>
                </span>
                <span class="side_note">
                  Points: <span class="points editable">${optionPoints}</span>
                  <input type="number" data-field="points" class="editor hidden" />
                  <button class="ebtn" data-action="edit">Edit</button>
                  <button data-action="remove_option">Remove</button>
                </span>
              </p>
            `;
        }

        html += `<button data-action="add_option">Add an Answer Option</button></div>`;
        div.innerHTML = html;
    } else { // Student version
        let html = `
            <div class="image">
                <img src="/img/placeholder.webp" />
            </div>
            <div class="text">
              <h2><span class="qwording">${question.question}</span></h2>
        `;

        for (let i = 0; i < question.options.length; ++i) {
            html += `
              <p class="option">
                <span>
                  <input type="checkbox" value="${question.options[i]}" />
                  <label class="answer">${question.options[i]}</label>
                </span>
              </p>
            `;
        }

        html += `</div>`;
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

    if (points) { // Editable (teacher) version
        // Ensure points structure exists
        if (!points.keywords) {
            points.keywords = [];
        }
        if (points.max_points === undefined) {
            points.max_points = 1;
        }

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
              <div class="word-answer-settings">
                <p class="option">
                  <span>
                    <label>Sample Answer: </label>
                    <textarea class="sample-answer editable" disabled>${question.sample_answer || ''}</textarea>
                    <textarea class="editor hidden" data-field="sample_answer" ></textarea>
                    <button class="ebtn" data-action="edit">Edit</button>
                  </span>
                </p>
                <p class="option">
                  <span>
                    <label>Max Points: </label>
                    <span class="points editable">${points.max_points}</span>
                    <input type="number" data-field="max_points" class="editor hidden" min="0" step="0.5" />
                    <button class="ebtn" data-action="edit">Edit</button>
                  </span>
                </p>
                <div class="keywords-section">
                  <h3>Auto-Scoring Keywords</h3>
                  <p class="note">Students get points when their answer contains these keywords</p>
        `;

        // Display existing keywords - Fixed to use correct variables and structure
        for (let i = 0; i < points.keywords.length; i++) {
            const keyword = points.keywords[i];
            // Handle both array format [word, points] and object format {word, points}
            const word = Array.isArray(keyword) ? keyword[0] : keyword.word;
            const keywordPoints = Array.isArray(keyword) ? keyword[1] : keyword.points;
            
            html += `
              <p class="keyword-item" data-keyword_ind="${i}">
                <span>
                  <label>Keyword: </label>
                  <span class="keyword editable">${word}</span>
                  <input class="editor hidden" data-field="keyword" />
                  <button class="ebtn" data-action="edit">Edit</button>
                </span>
                <span class="side_note">
                  Points: <span class="keyword-points editable">${keywordPoints}</span>
                  <input type="number" data-field="keyword_points" class="editor hidden" min="0" step="0.5" />
                  <button class="ebtn" data-action="edit">Edit</button>
                  <button data-action="remove_keyword">Remove</button>
                </span>
              </p>
            `;
        }

        html += `
                  <button data-action="add_keyword">Add Keyword</button>
                </div>
              </div>
            </div>
        `;
        div.innerHTML = html;
    } else { // Student version
        let html = `
            <div class="image">
                <img src="/img/placeholder.webp" />
            </div>
            <div class="text">
              <h2><span class="qwording">${question.question}</span></h2>
              <p class="option">
                <label>Your Answer: </label>
                <textarea name="word_answer_${ind}" placeholder="Type your answer here..." rows="4"></textarea>
              </p>
            </div>
        `;
        div.innerHTML = html;
    }

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
    const result = {
        isset: false,
        val: null
    };

    const ind = question_div.dataset.question_ind;
    const input = question_div.querySelector(`input[name="number_answer_${ind}"]`);

    if (input && input.value.trim() !== '') {
        result.isset = true;
        result.val = input.value.trim();
    }

    return result;
}

function gather_answer_word(question_div) {
    const result = {
        isset: false,
        val: null
    };

    const ind = question_div.dataset.question_ind;
    const input = question_div.querySelector(`textarea[name="word_answer_${ind}"]`);

    if (input && input.value.trim() !== '') {
        result.isset = true;
        result.val = input.value.trim();
    }

    return result;
}

