import sys, json, numpy as np
from dateutil import parser
from datetime import date, datetime
import pandas as pd
#from dateutil import relativedelta
#
##Read data from stdin
def read_in():
    sensordata = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(sensordata[0])

#print('hi from python')
def main():
#    print('in man function');
#    print("hi from python")
#    #get our data as an array from read_in()
    data = read_in()
#    print('reached hre')
    
    frequency = data[0]
    attributes = data[1]
    sensor_sets = data[2];
    start_time = data[3];
    end_time = data[4]
    annual_data = data[5]
    monthly_data = data[6]
    daily_data = data[7]
    hourly_data = data[8]

    sensorIds = [];
    for sensor_set in sensor_sets:
        for sensor in sensor_set:
            sensorIds.append(sensor)
    sensorIds = list(set(sensorIds))
    
    (annual_data_index, monthly_data_index, daily_data_index, hourly_data_index) = get_sensor_index(sensorIds[0],
                                                                                                    annual_data,
                                                                                                    monthly_data,
                                                                                                    daily_data,
                                                                                                    hourly_data)
#    
    (finaldata, finallabels) = organize_sensor_data(attributes[0], frequency, start_time, end_time, annual_data[0],
                         monthly_data[0], daily_data, hourly_data)
    
    finaldata= pd.DataFrame(finaldata)
    
    (values, labels) = organize_all_sensor_data(attributes, frequency, sensorIds, start_time, end_time, 
                             annual_data, monthly_data, daily_data, hourly_data)
    

#    print('lne of values', len(values[0]))
#    print('len of labels', (labels))
#    print('bar graph data', type(prepare_bar_graph(values)))
#    print('data to nodejs', {'labels': labels, 'values': prepare_bar_graph(values)  })
    print(json.dumps({'labels': labels, 'values': prepare_bar_graph(values)}))

    
#    print('mean is ', finaldata.std(axis=1))

#    print('finla data', finaldata)
#    print(json.dumps(dict(finaldata.mask(finaldata.isna(), 0))))
#    print(json.dumps({'labels': finallabels, 'values': list(finaldata.mask(finaldata.isna(), 0))}))
    
#    print('final data', finaldata)
#    print('final labels', finallabels)
#    print('data organizing done')    


    
   
def organize_sensor_data(attribute, frequency, start_time, end_time, sensor_annual_data, 
                         sensor_monthly_data, sensor_daily_data, sensor_hourly_data):
     if frequency =='daily':
        start_time = parser.parse(start_time[0:-1])
        end_time = parser.parse(end_time[0:-1])
        delta = (date(end_time.year, end_time.month,
        end_time.day) - date(start_time.year, start_time.month,
        start_time.day))
        finaldata = []
        finallabels = []
        no_days= delta.days + 1;
        finaldata = [[] for i in range (no_days)]
        finallabels = [None for i in range(no_days)]
        for year in sensor_annual_data:
            for month in year['monthArray']:
                if start_time.year == (year['year'] + 1900) and start_time.month > month['month']:
                    continue
                if end_time.year == (year['year'] + 1900) and end_time.month < month['month']:
                    break                
                for day in month['dayArray']:
                    if start_time.year == year['year'] and start_time.month == month['month'] and start_time.day > day['date']:
                        continue
                    if end_time.year == year['year'] and end_time.month == month['month'] and end_time.day < day['date']:
                        break
                    for hour in day['hourArray']:
                        s_time= date(start_time.year, start_time.month, 
                                 start_time.day)
                        for reading in hour['readingArray']:
                            read_time = parser.parse(reading['timeStamp'][0:-1])
                            diff = date(read_time.year, read_time.month,
                                    read_time.day)-s_time;
                            index=diff.days;
                            label=(str(read_time)[0:10])
                            if index in range(0, no_days):
                                finaldata[index].append(reading[attribute])
                                finallabels[index]=label

        for month in sensor_monthly_data:
            for day in month['dayArray']:
                if end_time.month == month['month'] and end_time.day < day['date']:
                    break;
                if start_time.month == month['month'] and start_time.day > day['date']:
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
                        if index in range(0, no_days):
                            finaldata[index].append(reading[attribute])
                            finallabels[index]=label
       
        for day in sensor_daily_data:
            for hour in day['hourArray']:
    
                s_time = date(start_time.year, start_time.month, 
                         start_time.day)
                for reading in hour['readingArray']:
                    read_time = parser.parse(reading['timeStamp'][0:-1])
                    diff = date(read_time.year, read_time.month,
                                    read_time.day)-s_time;
                    index=diff.days;
                    label=(str(read_time)[0:10])
                    if index in range(0, no_days):
                        finaldata[index].append(reading[attribute])
                        finallabels[index]=label
                        
        for hour in sensor_hourly_data:
            s_time = date(start_time.year, start_time.month, 
                     start_time.day)
            for reading in hour['readingArray']:
                read_time = parser.parse(reading['timeStamp'][0:-1])
                diff = date(read_time.year, read_time.month,
                            read_time.day)-s_time;
                index=diff.days;
                label=(str(read_time)[0:10])
                if index in range(0, no_days):
                    finaldata[index].append(reading[attribute])
                    finallabels[index]=label

        return (finaldata,finallabels)
    
    
     if frequency=='hourly':
        start_time = parser.parse(start_time[0:-1])
        end_time = parser.parse(end_time[0:-1])
        delta = (datetime(end_time.year, end_time.month,
        end_time.day, end_time.hour) - datetime(start_time.year, start_time.month,
        start_time.day, start_time.hour))
        finaldata = []
        finallabels = []
        no_hours=delta.days*24 + delta.seconds//3600 + 1;
        finaldata = [[] for i in range (no_hours)]
        finallabels = [None for i in range(no_hours)]
        for year in sensor_annual_data:
            for month in year['monthArray']:
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        s_time= datetime(start_time.year, start_time.month, 
                                 start_time.day, start_time.hour)
                        for reading in hour['readingArray']:
                            read_time = parser.parse(reading['timeStamp'][0:-1])
                            diff = datetime(read_time.year, read_time.month,
                                    read_time.day, read_time.hour)-s_time;
                            index=diff.days*24 + diff.seconds//3600;
                            label=(str(read_time)[0:-9] + ","+
                                   str(read_time)[-9:-6]+"th Hour")
                            if index in range(0, no_hours):
                                finaldata[index].append(reading[attribute])
                                finallabels[index]=label
        
        for month in sensor_monthly_data:
            for day in month['dayArray']:
                for hour in day['hourArray']:
                    s_time = datetime(start_time.year, start_time.month, 
                             start_time.day, start_time.hour)
                    for reading in hour['readingArray']:
                        read_time = parser.parse(reading['timeStamp'][0:-1])
                        diff = datetime(read_time.year, read_time.month,
                                read_time.day, read_time.hour)-s_time;
                        index=diff.days*24 + diff.seconds//3600;
                        label=(str(read_time)[0:-9] + ","+
                               str(read_time)[-9:-6]+"th Hour")
                        if index in range(0, no_hours):
                            finaldata[index].append(reading[attribute])
                            finallabels[index]=label
        
        for day in sensor_daily_data:
            for hour in day['hourArray']:
        
                s_time = datetime(start_time.year, start_time.month, 
                         start_time.day, start_time.hour)
                for reading in hour['readingArray']:
                    read_time = parser.parse(reading['timeStamp'][0:-1])
                    diff = datetime(read_time.year, read_time.month,
                                    read_time.day, read_time.hour)-s_time;
                    index=diff.days*24 + diff.seconds//3600;
                    label=(str(read_time)[0:-9] + ","+
                    str(read_time)[-9:-6]+"th Hour")
                    if index in range(0, no_hours):
                        finaldata[index].append(reading[attribute])
                        finallabels[index]=label
        for hour in sensor_hourly_data:
            s_time = datetime(start_time.year, start_time.month, 
                     start_time.day, start_time.hour)
            for reading in hour['readingArray']:
                read_time = parser.parse(reading['timeStamp'][0:-1])
                diff = datetime(read_time.year, read_time.month,
                            read_time.day, read_time.hour)-s_time;
                index=diff.days*24 + diff.seconds//3600;
                label=(str(read_time)[0:-9] + ","+
                    str(read_time)[-9:-6]+"th Hour")
                if index in range(0, no_hours):
                    finaldata[index].append(reading[attribute])
                    finallabels[index]=label
                    
        return (finaldata, finallabels)
    
     if frequency == 'annual':
        start_time = parser.parse(start_time[0:-1])
        end_time = parser.parse(end_time[0:-1])
        num_of_years = end_time.year - start_time.year + 1
        final_annual_data = [[] for year_num in range(num_of_years)]
        final_annual_labels = [None for year_num in range(num_of_years)]

        for year in sensor_annual_data:
            index = (year['year'] -100 + 2000) - start_time.year#change it later
            for month in  year['monthArray']:
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        for reading in hour['readingArray']:
                            final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = year['year'] - 100 + 2000
                  

        for month in sensor_monthly_data:
            index = (month['year'] - 100 + 2000) - start_time.year
            for day in month['dayArray']:
                for hour in day['hourArray']:
                    for reading in hour['readingArray']:
                        final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = month['year']
        
        
        for day in sensor_daily_data:
            index = (day['year'] - 100 + 2000) - start_time.year
            for hour in day['hourArray']:
                for reading in hour['readingArray']:
                    final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = day['year']


        for hour in sensor_hourly_data:
            index = (hour['year'] - 100 + 2000) - start_time.year
            for reading in hour['readingArray']:
                final_annual_data[index].append(reading[attribute])
            final_annual_labels[index] = hour['year']

        return (final_annual_data, final_annual_labels)
    
     if frequency == 'monthly':
        start_time = pd.Timestamp(start_time[0:-1])
        end_time = pd.Timestamp(end_time[0:-1])
        num_of_months = (end_time.to_period('M') - start_time.to_period('M')).n + 1
        final_monthly_data = [[] for month_num in range(num_of_months)]
        final_monthly_labels = [None for month_num in range(num_of_months)]
        for year in sensor_annual_data:
            for month in year['monthArray']:
                    current_time = pd.Timestamp(year['year'] + 1900, int(month['month']), 1)
                    index = (current_time.to_period('M') - start_time.to_period('M')).n
                    if index in range(num_of_months):
                        for day in month['dayArray']:
                            for hour in day['hourArray']:
                                for reading in hour['readingArray']:
                                    final_monthly_data[index].append(reading[attribute])
                        final_monthly_labels[index] = str(current_time.to_period('M'))
                    


        for month in sensor_monthly_data:
            current_time = pd.Timestamp(month['year'] + 1900, int(month['month']), 1)
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            if index in range(num_of_months):
                for day in month['dayArray']:
                    for hour in day['hourArray']:
                        for reading in hour['readingArray']:
                            final_monthly_data[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))
            
                
        for day in sensor_daily_data:
            current_time = pd.Timestamp(day['year']+1900, day['month']+1, day['date'])
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            if index in range(num_of_months):
                for hour in day['hourArray']:
                    for reading in hour['readingArray']:
                        final_monthly_data[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))
            
        
        for hour in sensor_hourly_data:
            current_time = pd.Timestamp(hour['year'] + 1900, hour['month'], hour['date'])
            index = (current_time.to_period('M') - start_time.to_period('M')).n
            if index in range(num_of_months):
                for reading in hour['readingArray']:
                    final_monthly_labels[index].append(reading[attribute])
                final_monthly_labels[index] = str(current_time.to_period('M'))

        return (final_monthly_data, final_monthly_labels)
   

def get_sensor_index(sensorId, annual_data, monthly_data, daily_data, hourly_data):
    annual_data_index = -1
    monthly_data_index = -1
    daily_data_index = -1
    hourly_data_index = -1
    
#    print('in function get_sensor_index, vlaue of sensorId', sensorId)
        
    for  sensor_year_data in range(len(annual_data)):
        if str(annual_data[sensor_year_data][0]['sensorId']) == sensorId:
            annual_data_index = sensor_year_data
            break;
    
    for sensor_month_data in range(len(monthly_data)):
        if str(monthly_data[sensor_month_data][0]['sensorId']) == sensorId:
            monthly_data_index =sensor_month_data
            break;
            
    for sensor_date_data in range(len(daily_data)):
        if str(daily_data[sensor_date_data][0]['sensorId']) == sensorId:
            daily_data_index = sensor_month_data
            break;
            
    for sensor_hour_data in range(len(hourly_data)):
        if str(hourly_data[sensor_hour_data][0]['sensorId']) == sensorId:
            hourly_data_index = sensor_hour_data
            break;
    return (annual_data_index, monthly_data_index, daily_data_index, hourly_data_index)


def organize_all_sensor_data(attributes, frequency, sensorIds, start_time, end_time, 
                             annual_data, monthly_data, daily_data, hourly_data):
    
    values = []
    labels = []
    labels_set = False
    
    for attribute in attributes:
        attribute_values_list = [];
        for sensorId in sensorIds:
            (annual_data_index, monthly_data_index, daily_data_index, hourly_data_index) = get_sensor_index(sensorId, 
                                                                                                            annual_data, 
                                                                                                            monthly_data, 
                                                                                                            daily_data, 
                                                                                                            hourly_data)
            sensor_annual_data = []
            sensor_monthly_data = []
            sensor_daily_data = []
            sensor_hourly_data = []
            
            if (annual_data_index != -1):
                sensor_annual_data = annual_data[annual_data_index]          
            if (monthly_data_index != -1):
                sensor_monthly_data = monthly_data[monthly_data_index]
            if (daily_data_index != -1):
                sensor_daily_data = daily_data[daily_data_index]
            if (hourly_data_index != -1):
                sensor_hourly_data = hourly_data[hourly_data_index]

            (finaldata, finallabels) = organize_sensor_data(attribute, frequency, 
                                                            start_time, end_time, 
                                                            sensor_annual_data, 
                                                            sensor_monthly_data, 
                                                            sensor_daily_data,
                                                            sensor_hourly_data)
            attribute_values_list.append(finaldata)
            if (labels_set == False):
                labels = finallabels
                labels_set = True
        
        values.append(attribute_values_list)
    
    return (values, labels)
            
            
def prepare_bar_graph(values):
#    print('in func preapare_bar_graph')
    attribute_data = [];
    for attribute in values:
        stats = {'mean': [], 'median': [], 'max': [], 'min': [], 'variance': [], 'stddev': []}
        for sensor_data in attribute:
#            print('sensor data len', len(sensor_data))
#            print('sensor data type', type(sensor_data))
            stats['mean'].append(sensor_data)
        stats['mean'] = np.array(stats['mean'])
#        print('dim are', np.stack(stats['mean'], axis=1).shape)
        data = prepare_data(np.stack(stats['mean'], axis=1))
#        print('data is', pd.DataFrame(data).var(axis=1))   ******very imp
        stats['mean'] = pd.DataFrame(data).mean(axis=1)
        stats['median'] = pd.DataFrame(data).median(axis=1)
        stats['max'] = pd.DataFrame(data).max(axis=1)
        stats['min'] = pd.DataFrame(data).min(axis=1)
        stats['variance'] = pd.DataFrame(data).var(axis=1)
        stats['stddev'] = pd.DataFrame(data).std(axis=1)
#        print('stats is', stats)
#        print('statsi', stats)
        attribute_data.append(stats)
#        print('\n\n\nattribute arrat;,', attribute_data)
#        print('data is', prepare_data(np.stack(stats['mean'], axis=1)))
#        print('mean is', prepare_data(np.stack(stats['mean'], axis=1)).mean())
#    print('\n\n\n\n\n\len nattribute data', (attribute_data))
    return attribute_data
#    print('attribute data len', (attribute_data))
#    print('attribute data type [0]', type(attribute_data[0]))

def prepare_data(array):
    stats = []
    for row in array:
        stats.append(pd.DataFrame(row.tolist()).values.flatten())
    return stats
        
#start process
if __name__ == '__main__':
    main()
