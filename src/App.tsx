import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

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
              (!start || dob >= start) &&
              (!end || dob <= end)
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
      <div style={{ padding: "20px" }}>
        <h2>Студенты по факультетам (Harry Potter API)</h2>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Дата рождения с:{" "}
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label style={{ marginLeft: "10px" }}>
            по:{" "}
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button onClick={handleFilter} style={{ marginLeft: "10px" }}>
            Построить график
          </button>
        </div>

        {filteredData.length > 0 && (
            <BarChart width={600} height={400} data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="house" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
        )}
      </div>
  );
};

export default App;