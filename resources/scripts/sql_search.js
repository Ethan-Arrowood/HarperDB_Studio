let saveSQL = '';
$(document).ready(function () {
    var sqlValue = document.getElementById('sqlLink').value;
    if (sqlValue != null && sqlValue != '' && sqlValue != undefined && sqlValue != 'undefined') {
        document.getElementById('exampleTextarea').value = sqlValue;
        runDatatable();
    }

    $("#collapseResult").hide()
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-full-width",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    var Textarea = Textcomplete.editors.Textarea;
    var textareaElement = document.getElementById('exampleTextarea')
    var editor = new Textarea(textareaElement);
    var keywords = JSON.parse(document.getElementById('keywordForAuto').value);

    var reserveWords = ['SELECT', 'INSERT', 'UPDATE', 'FROM', 'WHERE', 'INTO', 'SET', 'DELETE'].concat(keywords[0]);
    var schemaAndChilds = keywords[1];
    var textcomplete = new Textcomplete(editor, {
        dropdown: {
            maxCount: Infinity
        }
    });
    var curDotName = null;

    checkIsGetChild = (text) => {
        var match;
        match = text.match(/\b(\w+\.\w*)$/g);
        if (match == null)
            return true;
        else {
            var dot = match[0].lastIndexOf(".");
            curDotName = match[0].substring(0, dot);
            return false;
        }

    }

    textcomplete.register([{
        wordsBegin: reserveWords,
        match: /\b(\w+)$/,
        search: function (term, callback) {
            callback($.map(this.wordsBegin, function (word) {
                return word.toLowerCase().indexOf(term.toLowerCase()) === 0 ? word : null;
            }));
        },
        index: 1,
        replace: function (word) {
            curDotName = word;
            return word;
        },
        context: (text) => {
            return checkIsGetChild(text);
        }
    },
    {
        keywordAndChild: schemaAndChilds,
        match: /\b(\.\w*)$/,
        search: function (term, callback) {
            var dot = term.indexOf('.');
            var fontTerm = term.substring(0, dot - 1);
            var useWordArray = this.keywordAndChild[curDotName];
            callback($.map(useWordArray, function (word) {

                var subTerm = term.substring(dot + 1, term.length + 1);
                if (subTerm.length > 0)
                    return word.toLowerCase().indexOf(subTerm.toLowerCase()) === 0 ? word : null;
                else return word;

            }));
        },
        index: 1,
        replace: function (word, term) {

            return '.' + word;
        }
    },

    ]);

    $('#runSQL').click(() => {
        $("#collapseResultChart").hide();
        runDatatable();
    })

    //export
    // $('.fa-sign-out').click(() => {
    //     sTable.button(0).trigger();
    // });

    var schemas = $('#schemaAll').val()
    schemas = JSON.parse(schemas);
    schemaForSearch = Object.keys(schemas);

    $('#searchSchema').keyup(function () {
        var valueSearch = $('#searchSchema').val();
        if (valueSearch == '') {
            schemaForSearch.forEach(element => {
                $('#' + element).show();
            });
        } else {
            schemaForSearch.forEach(element => {
                $('#' + element).hide();
            });
            let results = [];
            valueSearch = valueSearch.toLowerCase();
            results = schemaForSearch.filter(x => x.toLowerCase().includes(valueSearch));
            results.forEach(element => {
                $('#' + element).show();
            });
        }
    });

    $("#favoriteForm").submit(function (event) {

        saveFavorite().then(() => {
            $('#saveModalCenter').modal('toggle');
        });
        event.preventDefault();
    });

    $('.dragablebtn.doubleclick').dblclick((e) => {

        var curValue = document.getElementById("exampleTextarea").value;

        var curSelectCusror = document.getElementById('exampleTextarea').selectionStart
        document.getElementById("exampleTextarea").value = curValue.substring(0, curSelectCusror) + e.target.attributes['value'].value + " " + curValue.substring(curSelectCusror, curValue.length);
    })

    $('li .doubleclick').dblclick((e) => {
        // console.log($(e.currentTarget).attr('value'));
        var curValue = document.getElementById("exampleTextarea").value;

        var curSelectCusror = document.getElementById('exampleTextarea').selectionStart
        document.getElementById("exampleTextarea").value = curValue.substring(0, curSelectCusror) + $(e.currentTarget).attr('value') + " " + curValue.substring(curSelectCusror, curValue.length);

    })
});

function saveFavorite() {
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: '/explore/setfavorite',
            data: {
                sql: saveSQL,
                note: document.getElementById('favoriteNote').value,
                name: document.getElementById('favoriteName').value
            },
            success: function (result) {
                toastr.success(JSON.stringify(result));
                resolve(true);
            },
            error: function (res) {
                console.log(res);
                document.location.href = '/logout';
            }
        })
    })

}

function copySqlLink() {
    /* Get the text field */
    var copyText = document.getElementById("liveLinkSQL");    

    /* Select the text field */
    copyText.focus();
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */
    // alert("Copied the text: " + copyText.value);
    toastr.success("Copied the text: " + copyText.value);
}

runDatatable = function () {
    var sql = document.getElementById('exampleTextarea').value;

    $(document.body).css({
        'cursor': 'wait'
    });
    $.ajax({
        type: "POST",
        url: '/explore/filter_search',
        data: {
            sql: sql
        },
        success: function (obj) {
            if (obj.result.error != undefined) {
                $("#collapseResult").hide()
                toastr.error(obj.result.error);
            } else if (typeof obj.result == 'string') {
                $("#collapseResult").hide()
                toastr.error(obj.result);
            } else {
                $("#collapseResult").show()
                toastr.success(obj.sql);
                saveSQL = obj.sql;
                var columnssss = [];
                if (obj.result.length > 0) {
                    Object.keys(obj.result[0]).forEach(element => {
                        columnssss.push({
                            title: element
                        })
                    });

                    var data = [];
                    obj.result.forEach(element => {
                        data.push(Object.values(element));
                    });
                    if ($.fn.DataTable.isDataTable('#resultTable')) {
                        sTable.destroy();
                        $('#resultTable').empty();
                    }
                    sTable = $('#resultTable').DataTable({
                        data: data,
                        columns: columnssss,
                        "dom": "<'col-md-12 datatable-over't><'col-md-4'<'pull-left'l>><'col-md-8 right-pagging'p>",
                        "lengthMenu": [
                            [10, 50, 100, -1],
                            [10, 50, 100, "All"]
                        ],
                        "iDisplayLength": 10,
                        buttons: [{
                            extend: 'csvHtml5',
                            text: '<i class="fa fa-refresh"></i>',
                            titleAttr: 'CSV'
                        }]
                    });
                    saveRecent(sql);
                } else {
                    if ($.fn.DataTable.isDataTable('#resultTable')) {
                        sTable.destroy();
                        $('#resultTable').empty();
                    }
                    if (obj.result.message)
                        toastr.success(obj.result.message);
                    else if (obj.result.length == 0)
                        toastr.info('data is empty');
                    else
                        toastr.info(JSON.stringify(obj.result));
                }
            }
            $(document.body).css({
                'cursor': 'default'
            });

        },
        error: function (err) {
            $(document.body).css({
                'cursor': 'default'
            });
            console.log(err);
            document.location.href = '/logout';
        }
    });
}

var saveRecent = (sql) => {
    var host = window.location.host;
    var encode = btoa(sql);
    var liveLink = host + '/explore/sql_search/' + encode
    var array = localStorage.getItem('recentSql')
    if (array == null)
        array = [];
    else {
        array = JSON.parse(array);
        if (array.length >= 7) {
            array.shift()
        }
    }

    var object = {
        sql: sql,
        url: liveLink
    }
    array.push(object);
    document.getElementById("liveLinkSQL").value = liveLink;
    localStorage.setItem('recentSql', JSON.stringify(array));
}