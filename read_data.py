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