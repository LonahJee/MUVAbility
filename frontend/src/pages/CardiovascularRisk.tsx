import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import brain from "brain";
import { RiskAssessmentResponse } from "types";

const CardiovascularRisk = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState<number>(50);
  const [gender, setGender] = useState<string>("1");
  const [chestPainType, setChestPainType] = useState<string>("0");
  const [systolicBp, setSystolicBp] = useState<number>(120);
  const [cholesterol, setCholesterol] = useState<number>(200);
  const [fastingBloodSugar, setFastingBloodSugar] = useState<string>("0");
  const [restingEkg, setRestingEkg] = useState<string>("0");
  const [maxHeartRate, setMaxHeartRate] = useState<number>(150);
  const [exerciseAngina, setExerciseAngina] = useState<string>("0");
  const [oldpeak, setOldpeak] = useState<number>(1.0);
  const [slope, setSlope] = useState<string>("1");
  const [numMajorVessels, setNumMajorVessels] = useState<string>("0");

  const [result, setResult] = useState<RiskAssessmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssessRisk = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await brain.assess_risk_v2({
        age,
        gender: Number(gender),
        chest_pain_type: Number(chestPainType),
        systolic_bp: systolicBp,
        cholesterol,
        fasting_blood_sugar: Number(fastingBloodSugar),
        resting_ekg: Number(restingEkg),
        max_heart_rate: maxHeartRate,
        exercise_induced_angina: Number(exerciseAngina),
        oldpeak,
        slope: Number(slope),
        num_major_vessels: Number(numMajorVessels),
      });

      if (response.ok) {
        const data: RiskAssessmentResponse = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setError(`Failed to get assessment: ${errorData.detail || "Please try again."}`);
      }
    } catch (err) {
      setError("An error occurred while contacting the server.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cardiovascular Risk Assessment</CardTitle>
          <Button onClick={() => navigate("/")} variant="outline">
            Home
          </Button>
        </CardHeader>
        <CardContent className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Male</SelectItem>
                    <SelectItem value="0">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chest-pain">Chest Pain Type</Label>
                <Select value={chestPainType} onValueChange={setChestPainType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Typical Angina</SelectItem>
                    <SelectItem value="1">Atypical Angina</SelectItem>
                    <SelectItem value="2">Non-Anginal Pain</SelectItem>
                    <SelectItem value="3">Asymptomatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="systolic-bp">Resting Blood Pressure (Systolic)</Label>
                <Input
                  id="systolic-bp"
                  type="number"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cholesterol">Serum Cholesterol (mg/dl)</Label>
                <Input
                  id="cholesterol"
                  type="number"
                  value={cholesterol}
                  onChange={(e) => setCholesterol(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Fasting Blood Sugar &gt; 120 mg/dl</Label>
                <Select value={fastingBloodSugar} onValueChange={setFastingBloodSugar}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">True</SelectItem>
                    <SelectItem value="0">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resting EKG Results</Label>
                <Select value={restingEkg} onValueChange={setRestingEkg}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal</SelectItem>
                    <SelectItem value="1">ST-T Wave Abnormality</SelectItem>
                    <SelectItem value="2">Probable or Definite LV Hypertrophy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-heart-rate">Max Heart Rate Achieved</Label>
                <Input
                  id="max-heart-rate"
                  type="number"
                  value={maxHeartRate}
                  onChange={(e) => setMaxHeartRate(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Exercise-Induced Angina</Label>
                <Select value={exerciseAngina} onValueChange={setExerciseAngina}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Yes</SelectItem>
                    <SelectItem value="0">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="oldpeak">Oldpeak (ST Depression)</Label>
                <Input
                  id="oldpeak"
                  type="number"
                  step="0.1"
                  value={oldpeak}
                  onChange={(e) => setOldpeak(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Slope of Peak Exercise ST Segment</Label>
                <Select value={slope} onValueChange={setSlope}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select slope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Upsloping</SelectItem>
                    <SelectItem value="2">Flat</SelectItem>
                    <SelectItem value="3">Downsloping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Major Vessels</Label>
                <Select value={numMajorVessels} onValueChange={setNumMajorVessels}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Button onClick={handleAssessRisk} disabled={isLoading} size="lg">
              {isLoading ? "Assessing..." : "Assess My Risk"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="w-full max-w-3xl mt-6">
          <CardHeader>
            <CardTitle>Assessment Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-12">
            <p className="font-medium">{result.message}</p>
            <p className="text-sm text-gray-600">
              <span className="font-bold">Model Risk Score:</span>{" "}
              {result.risk_score.toFixed(4)}
            </p>
            <p className="text-xs text-red-700 p-2 bg-red-50 rounded-md">
              <span className="font-bold">Disclaimer:</span> {result.disclaimer}
            </p>
          </CardContent>
        </Card>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default CardiovascularRisk;
