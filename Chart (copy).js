import React,  {Component} from 'react';
import { Bar,Line,Pie } from 'react-chartjs-2';  
var axios = require("axios");

// class Form extends Component{
//     constructor(props){
//         super(props)
//         this.state={
//                     sensorId: '',
//                     frequency: '3'
//         }
//     }
// handlesensorIdchange= event =>
// {
// this.setState(
//     {
//         sensorId:event.target.value
//     }
// )
// }
// handleFrequencyChange= event =>
// {
//     this.setState(
//         {
//             frequency:event.target.value
//         }
//     )
// }
// handleSubmit = event =>{
//     event.preventDefault()
// }
// // <div id='layout'>
//             //     <div className='clientInput'></div>
//     render(){   
//         return(     
//             // </div>
//             <form onSubmit={this.handleSubmit}>
//                 <div>
//                     <label>Senor ID</label>
//                     <input type="text" value={this.state.sensorId} onChange={this.handlesensorIdchange}/>
//                 </div>
//                 <div>
//                     <label>
//                         Frequency of data
//                     </label>
//                     <select value={this.state.frequency} onChange={this.handleFrequencyChange}>
//                         <option value ="yearly">Yearly</option>
//                         <option value ="monthly">Monthly</option>
//                         <option value ="daily">Daily</option>
//                         <option value ="hourly">Hourly</option>
 
//                     </select>
//                 </div>
//                 <button type="submit">Submit</button>
//             </form>
            
            
//         )
//     }
// }






class Chart extends Component{
    constructor(props){
        super(props);             //to intialise the parent constructor. Refer react documentation.
        this.state={};
        this.requestData();
    }
    static defaultProps ={
    displayTile:true,                    
    displayLegend:true,
    legendPosition:'right',
    location:'temperature'                            //the location must be made customisable.
}   

requestData = () =>
{
    axios.post("http://localhost:5000/graphdata").then(res=>{
        let labels = [];
        let data = [];
        let backgroundColor = [];
        console.log("the resss is "+ JSON.stringify(res));
        var t_no = res.data.temperatures.length;
        console.log(t_no);
        console.log(res)
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
        this.requestData();
        // console.log("Chart says hi")
        return(
            

            <div>
            
                 <Bar
                    data={this.state.chartData}
                    
                    options={{

                        title:{
                            display:this.props.displayTitle,
                    
                            text:this.props.location + ' data across time',          //notice there is no hardcoding, but the parameter must be passable by the client
                            fontSize:25
                        },
                        legend:{
                            display:this.props.displayLegend,
                            position:this.props.legendPosition
                        }

                    }}
                />


                    <Line
                    data={this.state.chartData}
                    
                    options={{

                        title:{
                            display:this.props.displayTitle,
                    
                            text:this.props.location + ' data across time',     //notice there is no hardcoding, but the parameter must be passable by the client
                            fontSize:25
                        },
                        legend:{
                            display:this.props.displayLegend,
                            position:this.props.legendPosition
                        }

                    }}
                />



                <Pie
                    data={this.state.chartData}
                    
                    options={{

                        title:{
                            display:this.props.displayTitle,
                    
                            text:this.props.location + ' data across time',
                            fontSize:25
                        },
                        legend:{
                            display:this.props.displayLegend,
                            position:this.props.legendPosition
                        }

                    }}
                />
             </div>
        )
    }
}

export default Chart;