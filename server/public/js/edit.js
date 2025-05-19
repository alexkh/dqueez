'use strict';
(function() {

var questions_div = document.querySelector('.questions');
var add_question_btn = document.querySelector('.add_question_btn');

add_question_btn.addEventListener('click', on_add_question);

function on_add_question(e) {
    let div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = `
        <div class="image">
            <img src="/img/placeholder.webp" />
        </div>
        <div class="text">
          <h2><span class="qtext">What will the question be?</span>
          <button>Edit question</button></h2>
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


})()
