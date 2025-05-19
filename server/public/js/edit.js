'use strict';
(function() {

var questions_div = document.querySelector('.questions');
var add_question_btn = document.querySelector('.add_question_btn');

function on_add_question(e) {
    let div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = `
        <div class="image">
            <img src="/img/placeholder.webp" />
        </div>
        <div class="text">
          <h2><span class="qtext">What will the question be?</span>
          <button data-action="edit_wording">Edit wording</button></h2>
          <p>
            <input type="radio" value="yes" />
            <label>Yes</label>
            <button>Edit option</button>
          </p>
          <p>
            <input type="radio" value="no" />
            <label>No</label>
            <button>Edit option</button>
          </p>

          <button>Add an Answer Option</button>
        </div>
`
    questions_div.append(div);
}

function on_edit_wording(e) {
    let elem = e.target.parentNode.querySelector('.qtext');
}

function on_click(e) {
    switch(e.target.dataset.action) {
    case 'add_question': on_add_question(e); break;
    case 'edit_wording': on_edit_wording(e); break;
    default: break;
    }
}

window.addEventListener('click', on_click);


})()
