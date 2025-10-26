// script.js - גרסה מתוקנת ומלאה עם החלפת תמונת באנר
// מטפל בעדכון שאלות, בדיקת תוצאה סופית, הסתרת תשובה שלישית ומניעת לחיצות כפולות

let currentquestion = {};
let isAnimating = false; // מגן מפני לחיצות במהלך אנימציות
const ORIGINAL_BANNER = "./assets/banner.png"; // שמירת נתיב הבאנר המקורי

let questions = [
  { "id": 1, "question": "כיצד היית מתאר את עצמך כסטודנט?", "ans1": "ממוקד ורגוע", "ans2": "אנרגטי ובלתי צפוי", "ans3": "", "result1": 3, "result2": 2, "result3": "" },
  { "id": 2, "question": "כמה קל לך להתרכז לאורך זמן?", "ans1": "אני יודע לשמור על ריכוז", "ans2": "המחשבות שלי בורחות מהר", "ans3": "", "result1": "פסיכיאטריה", "result2": "מיון", "result3": "" },
  { "id": 3, "question": "עד כמה אתה מסור לעבודה שלך?", "ans1": "משקיע בכל דבר שאני עושה", "ans2": "לפעמים חסר לי קצת מוטיבציה", "ans3": "", "result1": 4, "result2": 7, "result3": "" },
  { "id": 4, "question": "איך היית מתאר את הגישה שלך לאנשים?", "ans1": "נעימה ורגישה", "ans2": "ישירה ולעניין", "ans3": "ביקורתית וחדה", "result1": 5, "result2": 6, "result3": 9 },
  { "id": 5, "question": "עם מי פחות נוח לך לעבוד?", "ans1": "מבוגרים", "ans2": "ילדים", "ans3": "אין לי העדפה מיוחדת", "result1": "רופא ילדים", "result2": "רופא מבוגרים", "result3": 13 },
  { "id": 6, "question": "איזה סוג מטופלים היית מעדיף לטפל בהם?", "ans1": "כאלה שזקוקים למנוחה ושקט", "ans2": "כאלה שכבר סיימו את המסע שלהם", "ans3": "כאלה שמתמודדים עם מגבלה פיזית", "result1": "רופא מרדים", "result2": "פתולוגיה", "result3": 10 },
  { "id": 7, "question": "ממה אתה חושש יותר?", "ans1": "מהלא נודע ומהאור המסנוור", "ans2": "מהחושך ומהבלתי צפוי", "ans3": "", "result1": "רדיולוגיה", "result2": 8, "result3": "" },
  { "id": 8, "question": "כיצד היית מתאר את עצמך בעבודה?", "ans1": "יוזם ובעל ראש גדול", "ans2": "מעדיף להתמקד במשימות שלי בלבד", "ans3": "", "result1": 12, "result2": 11, "result3": "" },
  { "id": 9, "question": "איך היית מתאר את הקואורדינציה שלך?", "ans1": "מדויק ובעל יד יציבה", "ans2": "קצת פחות… יותר מגושם", "ans3": "", "result1": "מנתח נוירולוגי", "result2": "רופא מנתח", "result3": "" },
  { "id": 10, "question": "איך היית מגדיר את האופי שלך?", "ans1": "רגיש ואמפתי", "ans2": "ענייני ופחות רגשי", "ans3": "", "result1": "שיקום", "result2": "נוירולוגיה", "result3": "" },
  { "id": 11, "question": "לאילו צבעים אתה מתחבר יותר?", "ans1": "גוונים בהירים כמו צהוב", "ans2": "צבעים רגועים כמו כחול, חום או ירוק", "ans3": "צבעים נועזים כמו אדום או ורוד", "result1": "אורולוגיה", "result2": "רופא עיניים", "result3": "רופא אף אוזן גרון" },
  { "id": 12, "question": "מה מתאר אותך טוב יותר?", "ans1": "חנון של פרטים וידע", "ans2": "ספורטאי שאוהב אתגר ותנועה", "ans3": "", "result1": "דרמטולוגיה", "result2": "אורטופדיה", "result3": "" },
  { "id": 13, "question": "איזה סוג סביבת עבודה מתאימה לך יותר?", "ans1": "מסודרת וברורה", "ans2": "דינמית ומלאת הפתעות", "ans3": "", "result1": "רופא משפחה", "result2": "גינקולוגיה", "result3": "" }
]

// --- פונקציות עזר ---

/**
 * ממיר שם התמחות לשם קובץ תמונה
 * @param {string} specialty - שם ההתמחות (למשל "פסיכיאטריה")
 * @returns {string} - נתיב לתמונה
 */
function getSpecialtyImagePath(specialty) {
  // המרת הטקסט לשם קובץ - מסיר רווחים ומוסיף .png
  const fileName = specialty.trim().replace(/\s+/g, '_') + '.png';
  return `./assets/${fileName}`;
}

/**
 * מחליף את תמונת הבאנר
 * @param {string} imagePath - נתיב לתמונה החדשה
 */
function changeBannerImage(imagePath) {
  const $banner = $('img[alt="Banner"]');
  $banner.fadeOut(300, function() {
    $banner.attr('src', imagePath);
    $banner.fadeIn(300);
  });
}

/**
 * מחזיר את תמונת הבאנר למצב המקורי
 */
function resetBannerImage() {
  changeBannerImage(ORIGINAL_BANNER);
}

/**
 * מחזיר שאלה ע"פ id (מספר). משתמש ב-find כדי להיות בטוח.
 * @param {number} id
 */
function loadQuestion(id) {
  currentquestion = questions.find(q => q.id === Number(id));
}

/**
 * מעדכן את ה־DOM לפי currentquestion, ומסתיר/מציג כפתור תשובה C כנדרש.
 */
function update() {
  $("#game-question").stop(true).css({opacity: 0}).html(currentquestion.question).animate({opacity: 1}, 400);

  $("#answer-a").text(currentquestion.ans1).show();
  $("#answer-b").text(currentquestion.ans2).show();

  // בדיקה האם יש תשובה שלישית עם טקסט אמיתי (לא ריק וללא רווחים)
  if (currentquestion.ans3 && String(currentquestion.ans3).trim() !== "") {
    $("#answer-c").text(currentquestion.ans3).show();
  } else {
    $("#answer-c").hide();
  }
}

/**
 * בודק אם הערך הבא (resultX) הוא מספר שמצביע על שאלה נוספת.
 * תומך גם במספרים מסוג string כמו "5".
 * מחזיר true אם מדובר בתוצאה סופית (מחרוזת לא נומרית), false אם זה מספר/שאלה.
 */
function isFinalResult(result) {
  // אם result == null או "" => נחשב כסופי (לא אמור לקרות אם הנתונים תקינים)
  if (result === null || result === undefined || result === "") return true;
  // אם ניתן להמיר ל־Number והוא איננו NaN => זוהי שאלה
  const asNum = Number(result);
  return !isFinite(asNum);
}

/**
 * מציג תשובה סופית (טקסט) ומחליף את תמונת הבאנר
 */
function loadFinalAnswer(answer) {
  // אנימציה רכה:
  $("#game-content").fadeOut(250, function() {
    $("#game-question").html(` קיבלת: <b>${answer}</b>🎉`);
    $(".btn-answer").hide();
    $("#redirect").fadeIn(400);
    $("#game-content").fadeIn(250);
    
    // החלפת תמונת הבאנר בהתאם לתוצאה
    const specialtyImagePath = getSpecialtyImagePath(answer);
    changeBannerImage(specialtyImagePath);
    
    isAnimating = false;
  });
}

/**
 * מעבר לשאלה הבאה או טעינת תשובה סופית
 * @param {number} selectedIndex (1/2/3)
 */
function nextQuestion(selectedIndex) {
  if (isAnimating) return; // מונע לחיצות כפולות
  isAnimating = true;

  // קבלת ה'תוצאה' מהשאלה הנוכחית
  const key = "result" + selectedIndex;
  const next = currentquestion[key];

  // אם next הוא מספר (או string שניתן להמיר למספר) -> טען את השאלה הבאה
  if (!isFinalResult(next)) {
    // המרה ל־Number לפני טעינה
    const nextId = Number(next);
    $("#game-content").fadeOut(300, function() {
      loadQuestion(nextId);
      update();
      $("#game-content").fadeIn(300, function() {
        isAnimating = false;
      });
    });
  } else {
    // תוצאה סופית (טקסט) — נטפל כטקסט ונציג
    loadFinalAnswer(next);
  }
}

// --- אירועים והתחלה ---
$(document).ready(function() {
  // וידוא שהאלמנטים בסתר בתחילת הטעינה
  $("#game-body").hide();
  $("#redirect").hide();

  // התחלת המשחק
  $("#start-game").off("click").on("click", function() {
    if (isAnimating) return;
    isAnimating = true;
    $("#name-form").fadeOut(300, function() {
      loadQuestion(1);
      update();
      $("#game-body").fadeIn(500, function() {
        isAnimating = false;
      });
    });
  });

  // אירועי לחיצה רק לכפתורי התשובות
  $(".btn-answer").off("click").on("click", function() {
    if (isAnimating) return;
    // id של כפתור: answer-a / answer-b / answer-c
    const id = $(this).attr("id") || "";
    const lastChar = id.slice(-1); // 'a' / 'b' / 'c'
    // ממפה לאינדקס מספרי: a -> 1, b -> 2, c -> 3
    const map = { 'a': 1, 'b': 2, 'c': 3 };
    const selectedIndex = map[lastChar] || 0;
    if (selectedIndex === 0) return;
    nextQuestion(selectedIndex);
  });

  // כפתור נסה שוב - מאתחל חזרה לשאלה 1 ומחזיר את תמונת הבאנר המקורית
  $("#restart").off("click").on("click", function() {
    if (isAnimating) return;
    $("#redirect").fadeOut(200);
    // החזר הצגה של כפתורים
    $(".btn-answer").show();
    loadQuestion(1);
    update();
    // החזרת תמונת הבאנר המקורית
    resetBannerImage();
    // בעדינות נדאג שה־game-content יוצג
    $("#game-content").fadeIn(200);
  });
});