

var barChart = function (datas, options, element) {
    google.charts.setOnLoadCallback(drawAxisTickColors);

    function drawAxisTickColors() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.charts.Bar(element);
        chart.draw(data, google.charts.Bar.convertOptions(options));
    }
}

var lineChart = (datas, options, element) => {
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.charts.Line(element);

        chart.draw(data, google.charts.Line.convertOptions(options));
    }
}

var pieChart = (datas, options, element) => {
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.visualization.PieChart(element);
        chart.draw(data, google.charts.Line.convertOptions(options));
    }
}

var scatterChart = (datas, options, element) => {
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.charts.Scatter(element);
        chart.draw(data, google.charts.Scatter.convertOptions(options));
    }
}

var areaChart = (datas, options, element) => {
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datas);        
        var chart = new google.visualization.AreaChart(element);
        chart.draw(data, google.charts.Scatter.convertOptions(options));
    }
}
var steppedAreaChart = (datas, options, element) => {
    google.charts.setOnLoadCallback(drawChart);
    options.isStacked = true;
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.visualization.SteppedAreaChart(element);
        chart.draw(data, google.charts.Scatter.convertOptions(options));
    }
}

var bubbleChart = (datas, options, element) => {
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.visualization.BubbleChart(element);
        chart.draw(data, google.charts.Scatter.convertOptions(options));
    }
}

var columnChart = function (datas, options, element) {
    google.charts.setOnLoadCallback(drawAxisTickColors);

    function drawAxisTickColors() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.charts.Bar(element);
        options.bars = 'vertical';
        chart.draw(data, google.charts.Bar.convertOptions(options));
    }
}

var gaugeChart = function (datas, options, element) {

    options = {
        width: 400, height: 120,
        redFrom: 90, redTo: 100,
        yellowFrom: 75, yellowTo: 90,
        minorTicks: 5
    };

    google.charts.setOnLoadCallback(drawAxisTickColors);

    function drawAxisTickColors() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.visualization.Gauge(element);
        options.bars = 'vertical';
        chart.draw(data, options);
    }
}

var treemapChart = function (datas, options, element) {
    Object.assign(options, {
        minColor: '#f00',
        midColor: '#ddd',
        maxColor: '#0d0',
        headerHeight: 15,
        fontColor: 'black',
        showScale: true
    });
    google.charts.setOnLoadCallback(drawAxisTickColors);
    function drawAxisTickColors() {
        var data = google.visualization.arrayToDataTable(datas);
        var chart = new google.visualization.TreeMap(element);
        chart.draw(data, google.charts.Bar.convertOptions(options));
    }
}

var mapChart = (datas, options, element) => {
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datas);
        // var data = google.visualization.arrayToDataTable([
        //     ['Country', 'Population'],
        //     ['China', 'China: 1,363,800,000'],
        //     ['India', 'India: 1,242,620,000'],
        //     ['US', 'US: 317,842,000'],
        //     ['Indonesia', 'Indonesia: 247,424,598'],
        //     ['Brazil', 'Brazil: 201,032,714'],
        //     ['Pakistan', 'Pakistan: 186,134,000'],
        //     ['Nigeria', 'Nigeria: 173,615,000'],
        //     ['Bangladesh', 'Bangladesh: 152,518,015'],
        //     ['Russia', 'Russia: 146,019,512'],
        //     ['Japan', 'Japan: 127,120,000']
        // ]);
        var chart = new google.visualization.Map(element);
        chart.draw(data, google.charts.Line.convertOptions(options));
    }
}

var geoChartChart = (datas, options, element) => {
    google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {
        // var data = google.visualization.arrayToDataTable([
        //     ['Country', 'Popularity'],
        //     ['Germany', 200],
        //     ['United States', 300],
        //     ['Brazil', 400],
        //     ['Canada', 500],
        //     ['France', 600],
        //     ['RU', 700]
        // ]);
        var data = google.visualization.arrayToDataTable(datas);

        var chart = new google.visualization.GeoChart(element);

        chart.draw(data, options);
    }
}

var transformDataArray = (data) => {
    var transform = [];
    try {
        transform.push(Object.keys(data[0]))
        data.forEach(element => {
            transform.push(Object.values(element))
        });
        return transform;
    } catch(err) {
        return transform;
    }
}

var getData = (sql) => {
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: '/explore/filter_search',
            data: {
                sql: sql
            },
            success: function (obj) {                

                if (obj.result.error != undefined) {
                    toastr.error(obj.result.error);
                } else if (typeof obj.result == 'string') {
                    toastr.error(obj.result);
                } else {
                    resolve(obj.result)
                }
                resolve(false)
            },
            error: function (error) {
                console.log(error);
                document.location.href = '/logout';
            }
        })
    })
}

var generateChart = (graphType, sqlQuery, options) => {
    getData(sqlQuery).then(res => {
        $("#collapseResultChart").show();
        $("#collapseResult").hide()
        selectChart(graphType, res, options, document.getElementById('chart_div'));

    })
}

var selectChart = (graphType, data, options, element) => {    
    var data = transformDataArray(data);
    switch (graphType) {
        case "Line":
            lineChart(data, options, element)
            break;
        case "Bar":
            barChart(data, options, element)
            break;
        case "Pie":
            pieChart(data, options, element)
            break;
        case "Map":
            mapChart(data, options, element)
            break;
        case "Scatter":
            scatterChart(data, options, element)
            break;
        case "Area":
            areaChart(data, options, element)
            break;
        case "Bubble":
            bubbleChart(data, options, element)
            break;
        case "Column":
            columnChart(data, options, element)
            break;
        case "Gauge":
            gaugeChart(data, options, element)
            break;
        case "SteppedArea":
            steppedAreaChart(data, options, element)
            break;
        case "Treemap":
            treemapChart(data, options, element)
            break;
        case "GeoChart":
            geoChartChart(data, options, element)
            break;

    }
}
// document.getElementById('chart_div')