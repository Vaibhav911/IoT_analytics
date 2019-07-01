import sys, json, numpy as np
from dateutil import parser
from datetime import date

#Read data from stdin
def read_in():
    sensordata = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(sensordata[0])

def main():
    #get our data as an array from read_in()
    data = read_in()
    print (len(data))
    start_time = parser.parse(data[1][0:-1])
    print(str(start_time)[0:-6])
    end_time = parser.parse(data[2][0:-1])
    print(start_time)
    delta = (date(end_time.year, end_time.month,
    end_time.day) - date(start_time.year, start_time.month,
    start_time.day))
    print(delta)
    freq = data[0]
#    freq="daily"
    annual_data = data[3]
    monthly_data = data[4]
    daily_data = data[5]
    print('daily data', daily_data)
    hourly_data = data[6]
    attribute = 'humidity'
    finaldata = []
    finallabels = []
    print(len(annual_data))
    print(len(monthly_data))
    print(len(daily_data))
    print(len(hourly_data))
    
    if freq=='daily':
        no_days=delta.days + 1;
        finaldata = [[] for i in range (no_days)]
        finallabels = [None for i in range(no_days)]
        print (len(finaldata))
        for year in annual_data:
            for month in year['monthArray']:
                if start_time.year == (year['year'] + 1900) and start_time.month > month['month']:
                    continue
                if end_time.year == (year['year'] + 1900) and end_time.month < month['month']:
                    break                
                
#                print('month obj', month)
                for day in month['dayArray']:
                    if start_time.year == year['year'] and start_time.month == month['month'] and start_time.day > day['day']:
                        continue
                    if end_time.year == year['year'] and end_time.month == month['month'] and end_time.day < day['day']:
                        break
#                    print('day obj', day)
                    for hour in day['hourArray']:
#                        print ("hi")
#                        print (day['date'])
#                        diff = datetime((year['year']+1900), 6, day['date'], hour['hour'])
#                        print(diff)
                        s_time= date(start_time.year, start_time.month, 
                                 start_time.day)
#                        print(diff-b)
#                        
#                        print(index)
                        for reading in hour['readingArray']:
                            print ("reading obj", reading)
                            read_time = parser.parse(reading['timeStamp'][0:-1])
                            diff = date(read_time.year, read_time.month,
                                    read_time.day)-s_time;
                            index=diff.days;
                            label=(str(read_time)[0:10])
#                            print("Index is: "),
                            print(index)
                            if index in range(0, no_days):
#                                print(reading)
                                finaldata[index].append(reading[attribute])
                                finallabels[index]=label
        print('after annual dataq', finaldata)
        for month in monthly_data:
           
                
            for day in month['dayArray']:
                if end_time.month == month['month'] and end_time.day < day['day']:
                     break;
                if start_time.month == month['month'] and start_time.day > day['day']:
                    continue
                     
                for hour in day['hourArray']:
                    s_time = date(start_time.year, start_time.month, 
                             start_time.day)
                    for reading in hour['readingArray']:
                        read_time = parser.parse(reading['timeStamp'][0:-1])
                        diff = date(read_time.year, read_time.month,
                                read_time.day)-s_time;
                        index=diff.days;
                        label=(str(read_time)[0:10] )
#                            print("Index is: "),
#                            print(index)
                        if index in range(0, no_days):
#                                print(reading)
                            finaldata[index].append(reading[attribute])
                            finallabels[index]=label
       
        for day in daily_data:
            for hour in day['hourArray']:
    
                s_time = date(start_time.year, start_time.month, 
                         start_time.day)
                for reading in hour['readingArray']:
                    read_time = parser.parse(reading['timeStamp'][0:-1])
                    diff = date(read_time.year, read_time.month,
                                    read_time.day)-s_time;
                    index=diff.days;
                    label=(str(read_time)[0:10])
#                    print ("label is ",label)
                    if index in range(0, no_days):
#                                print(reading)
                        finaldata[index].append(reading[attribute])
                        finallabels[index]=label
                        
        print('after daily data', finaldata)
        for hour in hourly_data:
            s_time = date(start_time.year, start_time.month, 
                     start_time.day)
            print('hour obj in hourloop', hour)
            for reading in hour['readingArray']:
                read_time = parser.parse(reading['timeStamp'][0:-1])
                diff = date(read_time.year, read_time.month,
                            read_time.day)-s_time;
                index=diff.days;
                label=(str(read_time)[0:10])
                print ("label is ",label)
                if index in range(0, no_days):
#                                print(reading)
                    finaldata[index].append(reading[attribute])
                    finallabels[index]=label
    #            temp=j['timeStamp']
    #            finallabels.append(temp.getDate()+"-"+(temp.getMonth()+1)+"-"
    #           +temp.getFullYear()
        print('finaly data is', finaldata)
#        print('mean: ', np.array(finaldata).mean())
        for data in finaldata:
            print('len of data', len(data))
#        for i in range (0, no_days):
#            if (finallabels[i]!=None):
#                print (finallabels[i],":",finaldata[i])
#                arr = np.array(finaldata[i])
#                print("yo")
#                print("Maximum is:" , (np.median(arr)))
#                
#                print("Mean:",np.array(finaldata[i]).mean(axis=1))
#                print()
#    #    print(np.array(finaldata).mean())
#        print(type(data))

#start process
if __name__ == '__main__':
    main()
    
    
    
    
    
 ---------------------------------------

import sys, json, numpy as np
import pandas as pd
import datetime
from dateutil import parser
from dateutil import relativedelta
#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    data = read_in()
    freq = data[0]
    start_time = parser.parse(data[1][0:-1])
    end_time = parser.parse(data[2][0:-1])
    annual_data = data[3]
    monthly_data = data[4]
    daily_data = data[5]
    hourly_data = data[6]
    attribute = 'temperature'
    
#    print('frequency:', freq)
#    print('start time:', start_time)
#    print('end time:', end_time)
#    print('annual data', annual_data)
#    print('monthly data', monthly_data)
#    print('daily_data', daily_data)
#    print('hourly data len', len(hourly_data))
#    print('hourly data', hourly_data)

    if freq == 'annual':
        print('in annual')
        num_of_years = end_time.year - start_time.year + 1
        final_annual_data = [[] for year_num in range(num_of_years)]
        final_annual_labels = [None for year_num in range(num_of_years)]
        for year in annual_data:
            index = (year['year'] -100 + 2000) - start_time.year#change it later
            for month in  year['monthArray']:
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        for reading in hour['readingArray']:
                            final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = year['year'] - 100 + 2000
                  

        for month in monthly_data:
            index = (month['year'] - 100 + 2000) - start_time.year
            for day in month['dayArray']:
                for hour in day['hourArray']:
                    for reading in hour['readingArray']:
                        final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = month['year']
        
        
        for day in daily_data:
            index = (day['year'] - 100 + 2000) - start_time.year
            for hour in day['hourArray']:
                for reading in hour['readingArray']:
                    final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = day['year']


        for hour in hourly_data:
            index = (hour['year'] - 100 + 2000) - start_time.year
            for reading in hour['readingArray']:
                final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = hour['year']
        
        print('final annual data', final_annual_data)
        print('final labels array', final_annual_labels)
        print('mean is ' + str(np.array(final_annual_data).mean(axis=1)))
   




     
    if freq == 'monthly':
        start_time = pd.Timestamp(data[1][0:-1])
        end_time = pd.Timestamp(data[2][0:-1])
        num_of_months = (end_time.to_period('M') - start_time.to_period('M')).n + 1
        final_monthly_data = [[] for month_num in range(num_of_months)]
        final_monthly_labels = [None for month_num in range(num_of_months)]
        print('annual array len', len(annual_data))
        print('monthly array len', len(monthly_data))
        print('daily array len', len(daily_data))
        print('hourly array len', len(hourly_data))
        for year in annual_data:
            for month in year['monthArray']:
                    current_time = pd.Timestamp(year['year'] + 1900, int(month['month']), 1)
                    index = (current_time.to_period('M') - start_time.to_period('M')).n
                    if index in range(num_of_months):
                        for day in month['dayArray']:
                            for hour in day['hourArray']:
                                for reading in hour['readingArray']:
                                    final_monthly_data[index].append(reading[attribute])
                        final_monthly_labels[index] = str(current_time.to_period('M'))
                    


        for month in monthly_data:
            current_time = pd.Timestamp(month['year'] + 1900, int(month['month']), 1)
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            if index in range(num_of_months):
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        for reading in hour['readingArray']:
                            final_monthly_data[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))
            
        print('start time', start_time)
                
        for day in daily_data:
#            print('daily obj', day)
            current_time = pd.Timestamp(day['year']+1900, day['month']+1, day['date'])
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            print('calculated index', index, 'current time', current_time)
            if index in range(num_of_months):
                for hour in day['hourArray']:
                    for reading in hour['readingArray']:
                        final_monthly_data[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))
            
        
        for hour in hourly_data:
            current_time = pd.Timestamp(hour['year'] + 1900, hour['month'], hour['date'])
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            if index in range(num_of_months):
                for reading in hour['readingArray']:
                    final_monthly_labels[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))
            
        print('final monthly data', final_monthly_data)
        print('final monthly labels', final_monthly_labels)
        
        print('means is', np.array(final_monthly_data).mean(axis = 1))
            
                    
        
#        
        
            
        
        

#start process
if __name__ == '__main__': 
    main()
    
    
    
