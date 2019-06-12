import React, { Component } from 'react';
import './App.css';
//import axios from 'axios'
import Chart from './Chart';
//import Form from './Form';

class App extends Component {
  constructor(){
    super();
    this.state = {
                    
    }
  }
  

  render(){

        return (
          // <div className='formFromClient'>
          //   <Form>

          //   </Form>

          // </div>
          <div className="App">
            
            
          
           
          {/* {Object.keys(this.state.chartData).length && */}
            
            
            <Chart
            //   chartData={this.state.chartData}
            //   location="temperature"
            //   legendPosition="bottom"
            />
          {/* } */}
          </div>
        );

    }     
}

export default App;