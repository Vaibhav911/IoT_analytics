import React, { Component } from 'react';
import './App.css';
import axios from 'axios'
import Chart from './Chart';

class App extends Component {
  constructor(){
    super();
    this.state = {
      chartData:{}
    }
  }

  componentDidMount() {
    this.getChartData();
  }

  getChartData() {
    axios.get( "http://localhost:5000/graphtesting").then(res => {
        let labels = [];
        let data = [];
        let backgroundColor = [];
        var t_no = res.data.temperatures.length;
        console.log(t_no);
        for (var i=0;i<t_no;i++)
            {
              labels.push(res.data.labels[i]);
              data.push(res.data.temperatures[i]);
              var red = Math.floor(Math.random()*256);
              var blue = Math.floor(Math.random()*256);
              var green = Math.floor(Math.random()*256);
              backgroundColor.push("rgba("+red+", "+blue+", "+green+", 0.6)");
            } 

      //  console.log(backgroundColor);
        this.setState({
          chartData: {
            labels:labels,
            datasets: [
              {
                label: "Temperature",
                data: data,
                backgroundColor: backgroundColor,
              }
            ]
          }
        });
      });
    }

  render(){

        return (
          <div className="App">
          {Object.keys(this.state.chartData).length &&
            <Chart
              chartData={this.state.chartData}
              location="temperature"
              legendPosition="bottom"
            />
          }
          </div>
        );

    }     
}

export default App;