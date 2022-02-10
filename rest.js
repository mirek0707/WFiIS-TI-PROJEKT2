var request;
var objJSON;

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: "readwrite" };

function getRequestObject() {
    if (window.ActiveXObject) {
        return (new ActiveXObject("Microsoft.XMLHTTP"));
    } else if (window.XMLHttpRequest) {
        return (new XMLHttpRequest());
    } else {
        return (null);
    }
}

var iDB_delete_req = indexedDB.deleteDatabase("survey_DB");

iDB_delete_req.onerror = function (event) {
};

iDB_delete_req.onsuccess = function (event) {
};

var iDB_req = indexedDB.open("survey_DB");
var db;

session();

iDB_req.onupgradeneeded = function () {
    db = iDB_req.result;
    var store = db.createObjectStore("survey", { keyPath: "ID", autoIncrement: true });
    store.createIndex("p1o1", "p1o1");
    store.createIndex("p1o2", "p1o2");
    store.createIndex("p2o1", "p2o1");
    store.createIndex("p2o2", "p2o2");
    store.createIndex("p2o3", "p2o3");
    store.createIndex("p2o4", "p2o4");
    store.createIndex("p2o5", "p2o5");
    store.createIndex("p3o1", "p3o1");
    store.createIndex("p3o2", "p3o2");

};

iDB_req.onsuccess = function (event) {
    db = iDB_req.result;
};

iDB_req.onerror = function (event) {
};

window.addEventListener('offline', function (e) {
    offline_menu();
    alert("Brak połączenia, strona przeszła w tryb offline");
    show_start();
}
);

window.addEventListener('online', function (e) {
    alert("Połączenie zostało przywrócone, pracujesz w trybie online");
    logout();
    niezalogowani_menu();
}
);

function get_id_session() {
    var temp;
    var cookies;
    cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        temp = cookies[i];
        while (temp.charAt(0) == " ") {
            temp = temp.substring(1, temp.length);
        }
        if (temp.indexOf("sessionID=") == 0) {
            return temp.substring("sessionID=".length, temp.length);
        }
    }
    return "";
}
function session() {
    var arr = {};
    var sessId = get_id_session();
    arr.ID_sesji = sessId;

    JSONData = JSON.stringify(arr);
    reqObj = getRequestObject();

    reqObj.onreadystatechange = function () {
        if (reqObj.readyState == 4 &&(reqObj.status == 200 || reqObj.status == 400)) 
        {
            JSONResponse = JSON.parse(reqObj.response);
            if (JSONResponse["status"] == "ok") {
                zalogowani_menu();
            }
        }
    };
    reqObj.open(
        "POST",
        "rest/session",
        true
    );
    reqObj.send(JSONData);
}

function set_cookies(value) {
    document.cookie = "sessionID=" + value + "; path=/";
}

function register_validation(form)
{
    if (form.login.value=="" || form.pass.value=="")
    {
        alert("Wypełnij wszystkie pola!");
        return false;
    }
    else if (form.login.value.length<5)
    {
        alert ("Zbyt krótki login. Powinien mieć przynajmniej 5 znaków.");
        return false;
    }
    else if (form.pass.value.length < 5) 
    {
        alert("Zbyt krótkie hasło. Powinno mieć przynajmniej 5 znaków.");
        return false;
    }
    else
        return true;

}
function register_user(form)
{
    if (register_validation(form))
    {
        var user = {};
        user.login=form.login.value;
        user.pass=form.pass.value;
        text=JSON.stringify(user);

        request=getRequestObject();
        request.onreadystatechange=function(){
            if (request.readyState == 4 && request.status == 200)
            {
                objJSON=JSON.parse(request.response);
                if(objJSON['status']=='ok')
                {
                    alert("Zarejestrowano pomyślnie. Zostaniesz przeniesiony do okna logowania.");
                    show_login();
                }
                else {
                    alert("Login znajduje się już w bazie.");
                }
            }
        };
        request.open("POST", "http://pascal.fis.agh.edu.pl/~9kolodziejmir/projekt2/rest/register", true);
        request.send(text);
    }
}

function login_user(form) {
    if (form.login.value == "" || form.pass.value == "") {
        alert("Wypełnij wszystkie pola!");
        return;
    }
    var user = {};
    user.login = form.login.value;
    user.pass = form.pass.value;
    text = JSON.stringify(user);

    request=getRequestObject();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            objJSON = JSON.parse(request.response);
            if (objJSON['status']=='ok')
            {
                set_cookies(objJSON['sessionID']);
                zalogowani_menu();
                alert("Zalogowałeś się pomyślnie.");
                show_survey();
            }
            else {
                alert("Wprowadzono błędne dane.")
            }
        }
    };
    request.open("POST", "http://pascal.fis.agh.edu.pl/~9kolodziejmir/projekt2/rest/login", true);
    request.send(text);
}

function logout()
{
    var session_id=get_id_session();
    var cookies={};
    cookies.sessionID=session_id;
    text=JSON.stringify(cookies);
    request=getRequestObject();
    request.onreadystatechange=function() 
    {
        if (request.readyState == 4 && request.status == 200) {
            objJSON = JSON.parse(request.response);
            if (objJSON['status'] == 'ok') 
            {
                set_cookies('');
                alert("Wylogowałeś się.");
                niezalogowani_menu();
                show_login();
            }
        }
    };
    request.open("POST", "http://pascal.fis.agh.edu.pl/~9kolodziejmir/projekt2/rest/logout", true);
    request.send(text);
}

function sendSurvey(form)
{
    var p1= form.p1.value;
    var p2= form.p2.value;
    var p3= form.p3.value;
    if (p1=="" || p2=="" || p3=="")
    {
        alert("Nie udzieliłeś odpowiedzi na wszystkie pytania.")
    }
    else
    {
        var data={};
        if (p1 == "p1o1")   data.p1o1=1; else   data.p1o1=0;
        if (p1 == "p1o2")   data.p1o2=1; else   data.p1o2=0;

        if (p2 == "p2o1")   data.p2o1=1; else   data.p2o1=0;
        if (p2 == "p2o2")   data.p2o2=1; else   data.p2o2=0;
        if (p2 == "p2o3")   data.p2o3=1; else   data.p2o3=0;
        if (p2 == "p2o4")   data.p2o4=1; else   data.p2o4=0;
        if (p2 == "p2o5")   data.p2o5=1; else   data.p2o5=0;

        if (p3 == "p3o1")   data.p3o1=1; else   data.p3o1=0;
        if (p3 == "p3o2")   data.p3o2=1; else   data.p3o2=0;

        if (get_id_session() == "" || !(window.navigator.onLine))
        {
            txt = JSON.stringify(data);
            var dbTr = db.transaction("survey", "readwrite");
            var obj = dbTr.objectStore("survey");

            if (obj.put(data))
                alert("Ankieta została wypełniona, a dane przesłane do lokalnej bazy.");
        }
        else {
            txt = JSON.stringify(data);
            request = getRequestObject();

            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    objJSON = JSON.parse(request.response);
                    if (objJSON['status'] == 'ok')
                        alert("Ankieta została wypełniona.");
                    else
                        alert("Wystąpił błąd. Spróbuj ponownie później");
                }
            };
            request.open("POST", "http://pascal.fis.agh.edu.pl/~9kolodziejmir/projekt2/rest/survey", true);
            request.send(txt);
        }
    }
}

function updateMongo()
{
    var dbTr = db.transaction("survey", "readwrite");
    var obj = dbTr.objectStore("survey");
    obj.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor)
        {
            var data={};
            data.p1o1 = cursor.value.p1o1;
            data.p1o2 = cursor.value.p1o2;

            data.p2o1 = cursor.value.p2o1;
            data.p2o2 = cursor.value.p2o2;
            data.p2o3 = cursor.value.p2o3;
            data.p2o4 = cursor.value.p2o4;
            data.p2o5 = cursor.value.p2o5;

            data.p3o1 = cursor.value.p3o1;
            data.p3o2 = cursor.value.p3o2;

            text=JSON.stringify(data);
            request=getRequestObject();
            request.onreadystatechange = function(){
                if (request.readyState == 4 && request.status == 200) {
                    objJSON = JSON.parse(request.response);
                    if (objJSON['status'] == 'ok')
                        alert("Dane z ankiet przechowywanych przez przeglądarkę zostały dodane do bazy.");
                }
            };
            request.open("POST", "http://pascal.fis.agh.edu.pl/~9kolodziejmir/projekt2/rest/survey", true);
            request.send(text);
            cursor.delete();
            cursor.continue();
        }
    };
}

function showResults()
{
    var p1Arr= [0, 0];
    var p2Arr= [0, 0, 0, 0, 0];
    var p3Arr= [0, 0];

    request=getRequestObject();
    request.onreadystatechange = function(){
        if(request.readyState == 4)
        {
            objJSON=JSON.parse(request.response);
            for (var id in objJSON)
            {
                p1Arr[0] += objJSON[id]["p1o1"];
                p1Arr[1] += objJSON[id]["p1o2"];

                p2Arr[0] += objJSON[id]["p2o1"];
                p2Arr[1] += objJSON[id]["p2o2"];
                p2Arr[2] += objJSON[id]["p2o3"];
                p2Arr[3] += objJSON[id]["p2o4"];
                p2Arr[4] += objJSON[id]["p2o5"];

                p3Arr[0] += objJSON[id]["p3o1"];
                p3Arr[1] += objJSON[id]["p3o2"];
            }
            histogram(p1Arr, p2Arr, p3Arr);
        }
    }
    request.open("GET", "http://pascal.fis.agh.edu.pl/~9kolodziejmir/projekt2/rest/getdata", true);
    request.send(null);
}

function histogram(p1, p2, p3) {
    var suma = p1[0]+p1[1];
    var chart1 = new CanvasJS.Chart("hist1",
    {
        title: {
            text: "Czy interesujesz się piłką nożną?"
        },
        axisY:{
            valueFormatString:"#%",
            minimum: 0
        },
        data: [
            {
                type: "column",
                yValueFormatString:"###.##%",
                dataPoints: [
                    { label: "Tak", y: (p1[0]/suma)},
                    { label: "Nie", y: (p1[1]/suma)}
                ]
            }
        ]
    });
    chart1.render();

    var chart2 = new CanvasJS.Chart("hist2",
        {
            title: {
                text: "Jak często oglądzasz mecze?"
            },
            axisY:{
              valueFormatString:"#%",
              minimum: 0
            },
            data: [
                {
                    type: "column",
                    yValueFormatString:"###.##%",
                    dataPoints: [
                        { label: "Kilka razy w tygodniu", y: (p2[0] / suma)},
                        { label: "Raz w tygodniu", y: (p2[1] / suma)},
                        { label: "Raz na miesiąc", y: (p2[2] / suma)},
                        { label: "Kilka razy w roku", y: (p2[3] / suma)},
                        { label: "Wcale", y: (p2[4] / suma)}
                    ]
                }
            ]
        });
    chart2.render();

    var chart3 = new CanvasJS.Chart("hist3",
        {
            title: {
                text: "Czy byłeś kiedykolwiek na meczy piłkarskim?"
            },
            axisY:{
              valueFormatString:"#%",
              minimum: 0
            },
            data: [
                {
                    type: "column",
                    yValueFormatString:"###.##%",
                    dataPoints: [
                        { label: "Tak", y: (p3[0] / suma)},
                        { label: "Nie", y: (p3[1] / suma)}
                    ]
                }
            ]
        });
    chart3.render();
}

function offline_menu() {
    document.getElementById("menu").innerHTML = `
    <nav>
        <a class="ra " onclick="show_survey()">Ankieta</a>
    </nav>`;
}

function niezalogowani_menu() {
    document.getElementById("menu").innerHTML = `
    <nav>
        <a class="ra " onclick="show_login()">Zaloguj się</a>
        <a class="ra " onclick="show_register()">Zarejestruj się</a>
        <a class="ra " onclick="show_survey()">Ankieta</a>
    </nav>`;
}

function zalogowani_menu() {
    document.getElementById("menu").innerHTML = `
    <nav>
        <a class="ra " onclick="show_survey()">Ankieta</a>
        <a class="ra " onclick="show_results()">Wyniki</a>
        <a class="ra " onclick="logout()">Wyloguj się</a>
    </nav>`;
}

function show_start() {
    document.getElementById("art1").innerHTML = `
    <div class="start" id="start">
        <h2>ANKIETA PIŁKARSKA</h2>
        <p>Mirosław Kołodziej</p>
    </div>`;
}

function show_login() {
    document.getElementById("art1").innerHTML = `
    <div class="login" id="login">
        <fieldset>
            <legend id="legend"><b>Logowanie</b></legend>
            <form method="post">
                <label for="login">Login:</label>
                <input type="text" id="login" name="login"><br><br>
                <label for="pass">Hasło</label>
                <input type="password" id="pass" name="pass"><br><br>
                <input type="button" id="button" class="button" value="Zaloguj się" onclick="login_user(this.form)" />
            </form>
        </fieldset>
    </div>`;
}

function show_register() {
    document.getElementById("art1").innerHTML = `
    <div class="rejestracja" id="rejestracja">
        <fieldset>
            <legend id="legend"><b>Rejestracja</b></legend>
            <form method="post">
                <label for="login">Login:</label>
                <input type="text" id="login" name="login"><br><br>
                <label for="pass">Hasło</label>
                <input type="password" id="pass" name="pass"><br><br>
                <input type="button" id="button" class="button" value="Zarejestuj się" onclick='register_user(this.form)' />
            </form>
        </fieldset>
    </div>`;
}

function show_survey() {
    document.getElementById("art1").innerHTML = `
    <div class="survey" id="survey">
        <fieldset>
            <legend id="legend"><b>Ankieta</b></legend>
            <form method="post">
                <p>Czy interesujesz się piłką nożną?<br>
                <input type="radio" id="p1odp1" name="p1" value="p1o1">
                <label for="p1odp1">Tak</label><br>
                <input type="radio" id="p1odp2" name="p1" value="p1o2">
                <label for="p1odp2">Nie</label><br></p>
    
                <p>Jak często oglądasz mecze?<br>
                <input type="radio" id="p2odp1" name="p2" value="p2o1">
                <label for="p2odp1">Kilka razy w tygodniu</label><br>
                <input type="radio" id="p2odp2" name="p2" value="p2o2">
                <label for="p2odp2">Raz w tygodniu</label><br>
                <input type="radio" id="p2odp3" name="p2" value="p2o3">
                <label for="p2odp3">Raz na miesiąc</label><br>
                <input type="radio" id="p2odp4" name="p2" value="p2o4">
                <label for="p2odp4">Kilka razy w roku</label><br>
                <input type="radio" id="p2odp5" name="p2" value="p2o5">
                <label for="p2odp5">Wcale</label><br></p>

                <p>Czy byłeś kiedykolwiek na meczu piłkarskim?<br>
                <input type="radio" id="p3odp1" name="p3" value="p3o1">
                <label for="p3odp1">Tak</label><br>
                <input type="radio" id="p3odp2" name="p3" value="p3o2">
                <label for="p3odp2">Nie</label><br></p>
    
                <input type="button" id="button" class="button" value="Wyślij" onclick="sendSurvey(this.form)" />
            </form>
        </fieldset>
    </div>`;
}

function show_results()
{
    updateMongo();
    document.getElementById("art1").innerHTML = `
    <fieldset style:"position: inherit;">
        <legend id="legend"><b>Statystyka</b></legend>
        <input type="button" id="buttonwynik" class="button" value="Pokaż wyniki" onclick="showResults()"/>
        <div class="hist1" id="hist1" style="height: 450px; width: 100%; margin-top: 30px; position: inherit;"></div>                    
        <div class="hist2" id="hist2" style="height: 450px; width: 100%; margin-top: 30px; position: inherit;"></div>                    
        <div class="hist3" id="hist3" style="height: 450px; width: 100%; margin-top: 30px; position: inherit;"></div>
    </fieldset>`;
}



