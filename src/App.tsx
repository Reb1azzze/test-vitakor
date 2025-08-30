import React, { useEffect, useState } from "react";
import { Card, DatePicker, Button, Form, Typography, Space } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Dayjs } from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

type Character = {
  name: string;
  house: string;
  dateOfBirth: string;
  hogwartsStudent: boolean;
};

type HouseCount = {
  house: string;
  count: number;
};

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredData, setFilteredData] = useState<HouseCount[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  useEffect(() => {
    fetch("https://hp-api.onrender.com/api/characters")
        .then((res) => res.json())
        .then((data: Character[]) => {
          setCharacters(data);
        });
  }, []);

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  const handleFilter = () => {
    const [start, end] = dateRange;

    const houses = ["Gryffindor", "Slytherin", "Hufflepuff", "Ravenclaw"];
    const counts: Record<string, number> = {
      Gryffindor: 0,
      Slytherin: 0,
      Hufflepuff: 0,
      Ravenclaw: 0,
    };

    characters
        .filter((c) => c.hogwartsStudent && c.house)
        .forEach((c) => {
          const dob = parseDate(c.dateOfBirth);
          if (!dob) return;

          if (
              (!start || dob >= start.toDate()) &&
              (!end || dob <= end.toDate())
          ) {
            counts[c.house] = (counts[c.house] || 0) + 1;
          }
        });

    const data: HouseCount[] = houses.map((house) => ({
      house,
      count: counts[house],
    }));

    setFilteredData(data);
  };

  return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center" }}>
            Студенты Хогвартса по факультетам
        </Title>

        <Card style={{ marginBottom: 20 }}>
          <Form layout="inline" style={{ justifyContent: "center" }}>
            <Form.Item label="Диапазон дат рождения">
              <RangePicker
                  value={dateRange}
                  onChange={(values) => setDateRange(values as [Dayjs, Dayjs])}
                  format="DD-MM-YYYY"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleFilter}>
                Построить график
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {filteredData.length > 0 && (
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <BarChart width={800} height={400} data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="house" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1890ff" />
                </BarChart>
              </Space>
            </Card>
        )}
      </div>
  );
};

export default App;