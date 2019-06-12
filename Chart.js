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
        this.state={


                    chartData:{},
                    sensorId: '1',
                    frequency: 'hourly',
                    startHour:'00',
                    endHour:'00',
                    startDay: '1',
                    endDay:'1',
                    startMonth:'00',
                    endMonth:'11',
                    startYear:'2012',
                    endYear:'2020',
                    stats:'Mean',
        };
        
    }
    static defaultProps ={
    displayTile:true,                    
    displayLegend:true,
    legendPosition:'right',
    location:'temperature'                            //the location must be made customisable.
} 


handleSensorIdChange= event =>
  {
  this.setState(
      {
          sensorId:event.target.value
      }
  )
  }
  handleFrequencyChange= event =>
  {
      this.setState(
          {
              frequency:event.target.value
          }
      )
  }
  handleSubmit = event =>{
      event.preventDefault()
      // console.log("Senshdhfh"+ this.state.sensorId)
      // console.log("Submitted" +JSON.stringify(this.state))
  
      // this.setState(
      //     {
      //                 sensorId: this.state.sensorId,
      //                 frequency: this.state.frequency,
      //                 startHour:this.state.startHour,
      //                 endHour:this.state.endHour,
      //                 startDay: this.state.startDay,
      //                 endDay:this.state.endDay,
      //                 startMonth:this.state.startMonth,
      //                 endMonth:this.state.endMonth,
      //                 startYear:this.state.startYear,
      //                 endYear:this.state.endYear,
      //                 stats:this.state.stats
      //     }
      // )
      // data={
      //     sensorId,
      //                 frequency,
      //                 startHour,
      //                 endHour,
      //                 startDay: this.state.startDay,
      //                 endDay:this.state.endDay,
      //                 startMonth:this.state.startMonth,
      //                 endMonth:this.state.endMonth,
      //                 startYear:this.state.startYear,
      //                 endYear:this.state.endYear,
      //                 stats:this.state.stats
  
      // }
      
      var link = "http://localhost:5000/graphdata?"
      + "sensorId=" + this.state.sensorId
      + "&frequency=" + this.state.frequency
      + "&startHour="+ this.state.startHour
      +"&endHour="+this.state.endHour
      +"&startDay="+this.state.startDay
      +"&endDay="+this.state.endDay
      +"&startMonth="+this.state.startMonth
      +"&endMonth="+this.state.endMonth
      +"&startYear="+this.state.startYear
      +"&endYear="+this.state.endYear
      +"&stats="+this.state.stats
  
      console.log(link)
  
  axios.post(link).then(res=>{
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
  handleStartHourChange = event =>{
      this.setState(
          {
              startHour:event.target.value
          }
      )
  
  }
  handleEndHourChange = event =>{
      this.setState(
          {
              endHour:event.target.value
          }
      )
  }
  
  handleStartDayChange = event =>{
      this.setState(
          {
              startDay:event.target.value
          }
      )
  }
  
  handleEndDayChange = event =>{
      this.setState(
          {
              endDay:event.target.value
          }
      )
  }
  
  
  handleStartMonthChange =event =>{
      this.setState(
          {
                  startMonth:event.target.value
          }
      )
  }
  
  handleEndMonthChange =event =>{
      this.setState(
          {
                  endMonth:event.target.value
          }
      )
  }
  
  
  
  
  handleStartYearChange =event =>{
      this.setState(
          {
              startYear:event.target.value
          }
      )
  }
  
  handleEndYearChange =event =>{
      this.setState(
          {
              endYear:event.target.value
          }
      )
  }
  
  handleStatsChange = event => this.setState({stats:event.target.value })
  // handleCalenderStart = date => {
  //     console.log('handleCalendarStart called');
  //     this.setState({ date })
  //     console.log("This is the strtdate:" + date)
  // }
  // handleCalenderEnd = event => this.setState({ endDate:event.target.value })
   
  
  
  
  // howStartDateTimePicker = () =>
  //   this.setState({ startDateTimePickerVisible: true });
  
  // showEndDateTimePicker = () => this.setState({ endDateTimePickerVisible: true });
  
  // hideStartDateTimePicker = () =>
  //   this.setState({ startDateTimePickerVisible: false });
  
  // hideEndDateTimePicker = () =>
  //   this.setState({ endDateTimePickerVisible: false });
  
  // handleStartDatePicked = date => {
  //   console.log("A date has been picked: ", date);
  //   this.hideStartDateTimePicker();
  // };
  
  // handleEndDatePicked = date => {
  //   console.log("A date has been picked: ", date);
  //   this.hideEndDateTimePicker();
  // };
  
  
  
  // <div id='layout'>
  componentDidMount() {
    //this.getChartData();
  }

  // getChartData() {
  //   chartData=this.state.chartData;
    
  //   }

// requestData = () =>
// {
//     axios.post("http://localhost:5000/graphdata").then(res=>{
//         let labels = [];
//         let data = [];
//         let backgroundColor = [];
//         console.log("the resss is "+ JSON.stringify(res));
//         var t_no = res.data.temperatures.length;
//         console.log(t_no);
//         console.log(res)
//         for (var i=0;i<t_no;i++)
//             {
//               labels.push(res.data.labels[i]);
//               data.push(res.data.temperatures[i]);
//               var red = Math.floor(Math.random()*256);
//               var blue = Math.floor(Math.random()*256);
//               var green = Math.floor(Math.random()*256);
//               backgroundColor.push("rgba("+red+", "+blue+", "+green+", 0.6)");
//             } 
    
//       //  console.log(backgroundColor);
//         this.setState({
//           chartData: {
//             labels:labels,
//             datasets: [
//               {
//                 label: "Temperature",
//                 data: data,
//                 backgroundColor: backgroundColor,
//               }
//             ]
//           }
//         });
//       });
// }



// handleSubmit = event =>{
//     event.preventDefault()
//     this.requestData();


// }
    render(){
       // this.requestData();
        // console.log("Chart says hi")
        //console.log("this is the response:"+ JSON.stringify(this.state))
        return(
            
            <div>
            
            <div>
            <form onSubmit={this.handleSubmit}>
                <div>
                    <label>Sensor ID</label>
                    <input type="text" value={this.state.sensorId} onChange={this.handleSensorIdChange}/>
                </div>
                <div>
                    <label>
                        Frequency of data
                    </label>
                    <select value={this.state.frequency} onChange={this.handleFrequencyChange}>
                        <option value="yearly">Yearly</option>
                        <option value="monthly">Monthly</option>
                        <option value="daily">Daily</option>
                        <option value="hourly">Hourly</option>
 
                    </select>
                    <br>
                    </br>
                    <br></br>
                </div>
                
                {/* <Button title="Show DatePicker" onPress={this.showDateTimePicker} />
                                    <DateTimePicker
                            isVisible={this.state.howStartDateTimePicker}
                            onConfirm={this.handleStartDatePicked }
                            onCancel={this.hideStartDateTimePicker }
                            /> */}


                <div>
                    <label>
                        Start Hour
                    </label>
                    <select value={this.state.startHour} onChange={this.handleStartHourChange}>
                    <option value="00">00</option> 
                    <option value="01">01</option> 
                    <option value="02">02</option> 
                    <option value="03">03</option> 
                    <option value="04">04</option> 
                    <option value="05">05</option> 
                    <option value="06">06</option> 
                    <option value="07">07</option> 
                    <option value="08">08</option> 
                    <option value="09">19</option> 
                    <option value="10">10</option> 
                    <option value="11">11</option> 
                    <option value="12">12</option> 
                    <option value="13">13</option> 
                    <option value="14">14</option> 
                    <option value="15">15</option> 
                    <option value="16">16</option> 
                    <option value="17">17</option> 
                    <option value="18">18</option> 
                    <option value="19">19</option> 
                    <option value="20">20</option> 
                    <option value="21">21</option> 
                    <option value="22">22</option> 
                    <option value="23">23</option> 
                </select>
                </div>

                <div>
                    <label>
                        Start Day
                    </label>
                    <input type="text" value={this.state.startDay} onChange={this.handleStartDayChange}/>
                </div>

                <div>
                    <label>
                        Start Month
                    </label>
                    <select value={this.state.startMonth} onChange={this.handleStartMonthChange}>
                    <option value="00">Jan</option> 
                    <option value="01">Feb</option> 
                    <option value="02">Mar</option> 
                    <option value="03">Apr</option> 
                    <option value="04">May</option> 
                    <option value="05">June</option> 
                    <option value="06">July</option> 
                    <option value="07">August</option> 
                    <option value="08">Sept</option> 
                    <option value="09">Oct</option> 
                    <option value="10">Nov</option> 
                    <option value="11">Dec</option> 
                    </select>
                </div>

                <div>
                    <label>Start Year</label>
                    <input type="text" value={this.state.startYear} onChange={this.handleStartYearChange}/>
                </div>

                <div>
                    <br></br>
                    <br></br>
                </div>

                <div>
                    <label>
                        End Hour
                    </label>
                    <select value={this.state.endHour} onChange={this.handleEndHourChange}>
                    <option value="00">00</option> 
                    <option value="01">01</option> 
                    <option value="02">02</option> 
                    <option value="03">03</option> 
                    <option value="04">04</option> 
                    <option value="05">05</option> 
                    <option value="06">06</option> 
                    <option value="07">07</option> 
                    <option value="08">08</option> 
                    <option value="09">19</option> 
                    <option value="10">10</option> 
                    <option value="11">11</option> 
                    <option value="12">12</option> 
                    <option value="13">13</option> 
                    <option value="14">14</option> 
                    <option value="15">15</option> 
                    <option value="16">16</option> 
                    <option value="17">17</option> 
                    <option value="18">18</option> 
                    <option value="19">19</option> 
                    <option value="20">20</option> 
                    <option value="21">21</option> 
                    <option value="22">22</option> 
                    <option value="23">23</option>
                    </select>
                </div>

                <div>
                    <label>
                        End Day
                    </label>
                    <input type="text" value={this.state.endDay} onChange={this.handleEndDayChange}/>
                </div>

                <div>
                    <label>
                        End Month
                    </label>
                    <select value={this.state.endMonth} onChange={this.handleEndMonthChange}>
                    <option value="00">Jan</option> 
                    <option value="01">Feb</option> 
                    <option value="02">Mar</option> 
                    <option value="03">Apr</option> 
                    <option value="04">May</option> 
                    <option value="05">June</option> 
                    <option value="06">July</option> 
                    <option value="07">August</option> 
                    <option value="08">Sept</option> 
                    <option value="09">Oct</option> 
                    <option value="10">Nov</option> 
                    <option value="11">Dec</option> 
                    </select>
                </div>
                
                <div><label>End Year</label>
                    <input type="text" value={this.state.endYear} onChange={this.handleEndYearChange}/>
                </div>





                
                {/* <div>
                    <label>
                        Start Hour
                    </label>
                                        <TimePicker
                            onChange={this.handleStartHourChange}
                            value={this.state.startHour}
                            />
                    
                </div> */}

                {/* <div>
                    <label>
                        End Hour
                    </label>

                           <TimePicker
                            onChange={this.handleEndHourChange}
                            value={this.state.endHour}
                            />
                    
                </div>
                <div style={{float :'left' }}>
                    <label>Start Date</label>
                            <Calendar
                            value={this.state.date}
                            onChange={this.handleCalenderStart}
                    
                    />
                </div> */}
                {/* <div style={{float :'left' }}>
                    <label>End Date</label>
                            <Calendar
                    onChange={this.handleCalenderEnd}
                    value={this.state.endDate}
                    />
                </div> */}

                <div>
                    <label>
                        <br></br>
                        <br></br>
                    </label>
                </div>

                <div style={{float :'left' }}>
                    <label>
                        Data Statistic 
                    </label>
                    <select value={this.state.stats} onChange={this.handleStatsChange}>
                        <option value="Mean">Mean</option>
                        <option value="Median">Median</option>
                        <option value="Mode">Mode</option>
                        
                    </select>
                </div>
                <button type="submit" color='#841584'>Submit</button>


            </form>

            </div>






          {/* // // <form onSubmit={this.handleSubmit}>
            // //     <div>
            // //         <button type="submit" color='#841584'>Plot Graph</button>
            // //     </div>
            //     </form> */}

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
             </div>
            
        )
    }
}

export default Chart;