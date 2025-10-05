import AgriDoctor from "@/components/AgriDoctor"

export default function AgriDoctorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agri Doctor</h1>
        <p className="text-gray-600 mt-1">Upload images of your crops to detect diseases using AI</p>
      </div>
      <AgriDoctor />
    </div>
  )
}