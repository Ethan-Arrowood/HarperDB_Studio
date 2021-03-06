
var globalOptions = {};
var gGraphType = null;
$(document).ready(function () {
    google.charts.load('current', { packages: ['corechart', 'line', 'bar', 'map', 'scatter', 'gauge', 'treemap', 'geochart'], 'mapsApiKey': 'AIzaSyAP0UYqFCuSOOIMOQ6Ltmrx1B79XUw4Tmw' });


    $("#clickGenerateChart, .fa-refresh-search").click(function () {
        var sqlQuery = $("#exampleTextarea").val();

        var options = {
            // 'width': 800,
            'height': 300,
            // chartArea: { width: '80%' },
            title: $('#chartTitle').val(),
            titleTextStyle: {
                color: '#333',
                bold: true,
            },
            // subtitle: $('#chartSubtitle').val(),
            hAxis: {
                title: $('#hTitle').val(),
                textStyle: { color: '#333' },
                titleTextStyle: { color: '#333' },
                gridlines: { color: '#1E4D6B' }
            },
            vAxis: {
                title: $('#vTitle').val(),
                textStyle: { color: '#333' },
                titleTextStyle: { color: '#333' },
                gridlines: { color: '#1E4D6B' }
            },
            bars: 'horizontal' // Required for Material Bar Charts.
            ,
            backgroundColor: '#C6C8CA',
            series: {
                0: { color: '#403B8A' },
                1: { color: '#009455' }
            },
            legend: {
                textStyle: {
                    color: '#333'
                }
            }
            , showTooltip: true,
            showInfoWindow: true
        };
        globalOptions = options;
        var gType = $("#type-chart").val()
        gGraphType = gType;

        generateChart(gType, sqlQuery, options);
    })

    $('#saveLivelinkCenter').on('shown.bs.modal', function (e) {
        var sqlQuery = $("#exampleTextarea").val();
        if (sqlQuery == undefined) {
            console.log('eieieiieieie')
            sqlQuery = buildSqlQuery();
        }
        $.ajax({
            type: "POST",
            url: '/livelink/getlivelink',
            data: {
                sql: sqlQuery,
                options: JSON.stringify(globalOptions),
                livelinkName: $('#livelinkName').val(),
                notes: $('#livelinkNote').val(),
                graphType: gGraphType
            },
            success: function (obj) {
                var host = window.location.host;
                var liveLink = host + '/livelink/public/' + obj
                $('#liveLinkUrl').val(liveLink);
            },
            error: function (error) {
                document.location.href = '/logout';
                console.log(error);
            }
        })
    })

    $('#shareLivelinkModal').on('shown.bs.modal', function (e) {
        $.ajax({
            type: "GET",
            url: '/livelink/livelinklist',
            success: function (result) {
                $('#livelinkList')
                    .empty()
                result.forEach(element => {

                    $('#livelinkList')
                        .append($("<option></option>")
                            .attr("value", element.en_url)
                            .text(element.livelinkName));
                });
                if (result.length > 0)
                    $('#liveLinkShareUrl').val(window.location.host + '/livelink/public/' + result[0].en_url)

            },
            error: function (error) {
                document.location.href = '/logout';
                console.log(error);
            }
        })
    });

    $('#livelinkList').on('change', function () {
        $('#liveLinkShareUrl').val(window.location.host + '/livelink/public/' + this.value)
    })

    $("#livelinkForm").submit(function (event) {
        console.log('eieieie');
        saveLivelink().then(() => {
            $('#saveLivelinkCenter').modal('toggle');
        });
        event.preventDefault();
    });
})



function copyLiveLink() {
    /* Get the text field */
    var copyText = document.getElementById("liveLinkUrl");

    /* Select the text field */
    // copyText.focus();
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */
    // alert("Copied the text: " + copyText.value);
    toastr.success("Copied the text: " + copyText.value);
}

function copyLiveLinkShare() {
    /* Get the text field */
    var copyText = document.getElementById("liveLinkShareUrl");

    /* Select the text field */
    // copyText.focus();
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */
    // alert("Copied the text: " + copyText.value);
    toastr.success("Copied the text: " + copyText.value);
}


function saveLivelink() {
    var sqlQuery = $("#exampleTextarea").val();

    if (sqlQuery == undefined)
        sqlQuery = buildSqlQuery()
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: '/livelink/save',
            data: {
                sql: sqlQuery,
                options: JSON.stringify(globalOptions),
                livelinkName: $('#livelinkName').val(),
                notes: $('#livelinkNote').val(),
                graphType: gGraphType
            },
            success: function (result) {
                toastr.success(JSON.stringify(result));
                resolve(true);
            }, error: function (err) {
                document.location.href = '/logout';
                console.log(err);
            }
        })
    })

}
