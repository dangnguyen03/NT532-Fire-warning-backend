const Data = require('../models/Data')

const dataController =
{
    //Get all
    getDataSensors: async (req, res) =>
    {
          try {
            // Lấy timestamp 7 ngày trước
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Lấy dữ liệu trong 7 ngày gần nhất và sắp xếp theo thời gian tăng dần
            const data = await Data.find({macAddr:req.params.macAddr, timestamp: { $gte: sevenDaysAgo } }).sort('timestamp').exec();

            const result = [];

            // Tính trung bình của các trường humid, temp, gas cho mỗi ngày
            for (let i = 0; i < 7; i++) {
              const dayData = data.filter(d => {
                const dataDate = d.timestamp.getDate();
                const currentDate = new Date().getDate() - i;
                return dataDate === currentDate;
              });

              const averageData = dayData.reduce(
                (accumulator, currentValue) => {
                  accumulator.humid += currentValue.humid;
                  accumulator.temp += currentValue.temp;
                  accumulator.gas += currentValue.gas;
                  return accumulator;
                },
                { humid: 0, temp: 0, gas: 0 }
              );

              averageData.humid /= dayData.length;
              averageData.temp /= dayData.length;
              averageData.gas /= dayData.length;
              result.unshift(averageData);
            }

            res.json(result);
          } catch (err) {
            console.error('Lỗi:', err);
            res.status(500).json({ error: 'Dữ liệu có vấn đề' });
          }
    },
    getDataDay: async (req, res) =>
      {
          try {
              // Lấy timestamp 7 giờ trước
              const sevenHoursAgo = new Date();
              sevenHoursAgo.setHours(sevenHoursAgo.getHours() - 7);
          
              // Lấy dữ liệu trong 7 giờ gần nhất và sắp xếp theo thời gian tăng dần

              const data = await Data.find({macAddr:req.params.macAddr, timestamp: { $gte: sevenHoursAgo } }).sort('timestamp').exec();
          
              const result = [];
          
              // Tính trung bình của các trường humid, temp, gas cho mỗi giờ
              for (let i = 0; i < 7; i++) {
                const hourData = data.filter(d => d.timestamp.getHours() === (new Date().getHours() - i));
                const averageData = hourData.reduce(
                  (accumulator, currentValue) => {
                    accumulator.humid += currentValue.humid;
                    accumulator.temp += currentValue.temp;
                    accumulator.gas += currentValue.gas;
                    return accumulator;
                  },
                  { humid: 0, temp: 0, gas: 0 }
                );
                averageData.humid /= hourData.length;
                averageData.temp /= hourData.length;
                averageData.gas /= hourData.length;
                result.unshift(averageData);
              }
          
              res.json(result);
            } catch (err) {
              console.error('Lỗi:', err);
              res.status(500).json({ error: 'Dữ liệu có vấn đề' });
            }
      },
    getDataMonth: async (req, res) =>
      {
          try {
              const sevenMonthsAgo = new Date();
              sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
          
              // Lấy dữ liệu trong 7 giờ gần nhất và sắp xếp theo thời gian tăng dần

              const data = await Data.find({macAddr:req.params.macAddr, timestamp: { $gte: sevenMonthsAgo } }).sort('timestamp').exec();
          
              const result = [];
          
              // Tính trung bình của các trường humid, temp, gas cho mỗi giờ
              for (let i = 0; i < 7; i++) {
                const monthData = data.filter(d => d.timestamp.getMonth() === (new Date().getMonth() - i));
                const averageData = monthData.reduce(
                  (accumulator, currentValue) => {
                    accumulator.humid += currentValue.humid;
                    accumulator.temp += currentValue.temp;
                    accumulator.gas += currentValue.gas;
                    return accumulator;
                  },
                  { humid: 0, temp: 0, gas: 0 }
                );
                averageData.humid /= monthData.length;
                averageData.temp /= monthData.length;
                averageData.gas /= monthData.length;
                result.unshift(averageData);
              }
          
              res.json(result);
            } catch (err) {
              console.error('Lỗi:', err);
              res.status(500).json({ error: 'Dữ liệu có vấn đề' });
            }
      },
  
}

module.exports = dataController

