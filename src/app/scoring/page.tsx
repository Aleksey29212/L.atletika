'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { calculateScore, timeToSeconds, secondsToTime } from '@/lib/utils';

const ScoringPage = () => {
  const generateScoreData = (distance: '500m' | '1000m') => {
    const data = [];
    const config = {
      '500m': { gold: timeToSeconds('01:30.00'), base: timeToSeconds('02:15.00') },
      '1000m': { gold: timeToSeconds('03:10.00'), base: timeToSeconds('04:30.00') },
    };

    const distConfig = config[distance];
    const step = (distConfig.base - distConfig.gold) / 10;

    for (let i = 0; i <= 10; i++) {
      const timeInSeconds = distConfig.gold + i * step;
      const timeString = secondsToTime(timeInSeconds);
      const points = calculateScore(distance, timeString);
      data.push({ time: timeString, points });
    }
    return data;
  };

  const data500m = generateScoreData('500m');
  const data1000m = generateScoreData('1000m');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Система начисления баллов</CardTitle>
          <CardDescription>
            Баллы рассчитываются на основе времени результата. Чем меньше время,
            тем больше баллов. Максимум — 100 баллов, минимум — 0.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Формула расчета</h3>
            <p className="text-sm text-muted-foreground">
              Если результат спортсмена лучше или равен "золотому" времени, он получает 100 баллов.
              Если результат хуже или равен "базовому" времени, он получает 0 баллов.
              В противном случае, баллы рассчитываются по формуле линейной интерполяции:
            </p>
            <pre className="mt-2 p-3 bg-muted rounded-md text-sm">
              <code>
                {`Баллы = ((БазовоеВремя - ВремяСпортсмена) / (БазовоеВремя - ЗолотоеВремя)) * 100`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Дистанция 500м</CardTitle>
            <CardDescription>
              Золотое время: 01:30.00 (100 баллов). Базовое время: 02:15.00 (0
              баллов).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Время (ММ:СС.сс)</TableHead>
                  <TableHead className="text-right">Баллы</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data500m.map((d) => (
                  <TableRow key={d.time}>
                    <TableCell>{d.time}</TableCell>
                    <TableCell className="text-right">{d.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Дистанция 1000м</CardTitle>
            <CardDescription>
              Золотое время: 03:10.00 (100 баллов). Базовое время: 04:30.00 (0
              баллов).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Время (ММ:СС.сс)</TableHead>
                  <TableHead className="text-right">Баллы</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data1000m.map((d) => (
                  <TableRow key={d.time}>
                    <TableCell>{d.time}</TableCell>
                    <TableCell className="text-right">{d.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScoringPage;
