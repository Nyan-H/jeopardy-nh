// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds(num) {
  //get request to API will return 100 ids (max allowed from API)
  let response = await axios.get("https://jservice.io/api/categories/", {
    params: { count: 100 },
  });

  //mapped the response data to array of IDs only
  let catIds = response.data.map((obj) => obj.id);

  return _.sampleSize(catIds, num);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const response = await axios.get("https://jservice.io/api/category", {
    params: { id: catId },
  });
  let data = response.data;
  let result = data.clues;
  let cat = result.map((obj) => {
    return {
      question: obj.question,
      answer: obj.answer,
      showing: null,
    };
  });
  return { title: data.title, result };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  let catIDs = await getCategoryIds(6);

  for (let cat of catIDs) {
    let data = await getCategory(cat);
    categories.push(data);
  }
  for (i = 0; i <= 5; i++) {
    $("#thead").append(`<th>${categories[i].title}</th>`);

    for (j = 0; j <= 5; j++) {
      $(`#tr${i}`).append(`<td id=${j} data-arr=${i} showing=null>?</td>`);
    }
  }
}

function handleClick(e) {
  let col = e.target.id;
  let row = $(e.target).attr("data-arr");
  if ($(e.target).attr("showing") === "null") {
    $(e.target).attr("showing", "question");
    $(e.target).text(`${categories[col].result[row].question}`);
  } else if ($(e.target).attr("showing") === "question") {
    $(e.target).attr("showing", "answer");
    $(e.target).html(`${categories[col].result[row].answer}`);
  }
}

function showLoadingView() {
  $("body").append("<div class='loader'></div>");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $(".loader").remove();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  categories = [];
  $("th").remove();
  $("td").remove();
  showLoadingView();
  await fillTable();
  hideLoadingView();
}

/** On click of start / restart button, set up game. */
$("#btn").on("click", function (e) {
  setupAndStart();
  $(e.target).text("Restart Game");
});

/** On page load, add event handler for clicking clues */

$(document).ready(function () {
  $("body").on("click", "tr", function (e) {
    handleClick(e);
  });
});
