import { Doctor } from "../models/doctors.model.js";
import { Patient } from "../models/patients.model.js";

export async function get_analytics_controller(_req, res, next) {
  try {
    const [
      totalDoctors,
      totalPatients,
      conditionBreakdown,
      patientsPerDoctor,
      monthlyGrowth,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.aggregate([
        { $group: { _id: "$condition", count: { $sum: 1 } } },
      ]),
      Patient.aggregate([
        {
          $group: {
            _id: "$doctorId",
            patientCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctor",
          },
        },
        { $unwind: "$doctor" },
        {
          $project: {
            _id: 0,
            doctorId: { $toString: "$doctor._id" },
            doctorName: "$doctor.name",
            specialization: "$doctor.specialization",
            patients: "$patientCount",
          },
        },
        { $sort: { patients: -1 } },
      ]),
      Patient.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$admissionDate" },
            },
            patients: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: "$_id",
            patients: 1,
          },
        },
      ]),
    ]);

    const statsByCondition = {
      Stable: 0,
      Monitoring: 0,
      Critical: 0,
      Recovering: 0,
    };
    for (const row of conditionBreakdown) {
      if (row._id in statsByCondition) {
        statsByCondition[row._id] = row.count;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDoctors,
          totalPatients,
          criticalPatients: statsByCondition.Critical,
          monitoringPatients: statsByCondition.Monitoring,
        },
        conditionBreakdown: statsByCondition,
        patientsPerDoctor,
        monthlyGrowth,
      },
    });
  } catch (error) {
    next(error);
  }
}
