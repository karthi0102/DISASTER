    
                   
               
                 google.charts.load("current", {packages:["corechart"]});
                 google.charts.setOnLoadCallback(drawChart);
                 google.charts.setOnLoadCallback(drawChart1);
                 google.charts.setOnLoadCallback(drawChart2);
                 function drawChart() {
                   var data = google.visualization.arrayToDataTable([
                     ['COMMUNITY', 'No of users'],
                    
                     ['NCC',    ncc.length],
                     ['NSS', nss.length],
                    
                   ]);
           
                   var options = {
                     title: 'AROUND INDIA',
                     is3D: true,
                   };
           
                   var chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
                   chart.draw(data, options);
                 }
                 function drawChart1() {
                    var data = google.visualization.arrayToDataTable([
                      ['COMMUNITY', 'No of users'],
                      ['SW', sw],
                      ['SD', sd],
                    
                     
                    ]);
            
                    var options = {
                      title: 'NCC',
                      is3D: true,
                    };
            
                    var chart = new google.visualization.PieChart(document.getElementById('nss_gender'));
                    chart.draw(data, options);
                  }
                  function drawChart2() {
                    var data = google.visualization.arrayToDataTable([
                      ['NSS', 'GENDER'],
                      ['Male', male],
                      ['Female', female],
                    
                     
                    ]);
            
                    var options = {
                      title: 'NSS',
                      is3D: true,
                    };
            
                    var chart = new google.visualization.PieChart(document.getElementById('ncc_gender'));
                    chart.draw(data, options);
                  }
               
               