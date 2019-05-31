import React, { Component } from 'react';
import './App.css';
import Chart from './Components/Chart'

class App extends Component {
  constructor(){
    super();
    this.state={
      chartData:{}

    }
  }
 
 componentWillMount(){
   this.getChartData();
 }
  getChartData()
  {this.setState({
      chartData:{
      labels: [
          '1 hour','2hour','3 hour','4 hour'],
      datasets:[
          {   //sample dataset.....needs to be passed
              label:'Temperature',
              data:[
                  35
              ,33,45,45
              ],
            //try to make this customisable
              backgroundColor:['rgba(254,99,132,0.6)','rgba(0, 255, 0, 0.3)','rgba(0, 0, 255, 0.3)','rgba(254,255,132,0.6)']
          }
      ]
  }

    
  })}
  render() {
    return (
      <div className="App">
        <div className="App-header">
         
          <h2>Graphs
          </h2>
        </div>
        <Chart chartData={this.state.chartData} location='temperature'/>
      </div>
    );
  }
}

export default App;
