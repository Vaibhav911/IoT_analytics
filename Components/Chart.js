import React,  {Component} from 'react';
import { Bar,Line,Pie } from 'react-chartjs-2';  

class Chart extends Component{
    constructor(props){
        super(props);             //to intialise the parent constructor. Refer react documentation.
        this.state={
            chartData:props.chartData                           
        
    }}
static defaultProps ={
    displayTile:true,                    
    displayLegend:true,
    legendPosition:'right',
    location:'temperature'                            //the location must be made customisable.

}    
    render(){
        return(
             <div classname="chart">
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
