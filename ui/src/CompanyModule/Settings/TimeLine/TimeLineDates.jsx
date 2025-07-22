import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import LayOut from "../../../LayOut/LayOut";
import { Link } from "react-router-dom";
import { deleteDueDatesById, getDueDates, patchDueDatesById, postDueDates } from "../../../Utils/Axios";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const TimeLineDates = () => {
   const { register, handleSubmit, setValue } = useForm();
  const [existingData, setExistingData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); // 'update' or 'delete'
  const [disableDays] = useState(["31"]); // Example: disable 31st

  useEffect(() => {
    fetchDueDates();
  }, []);

  const fetchDueDates = async () => {
    try {
      const res = await getDueDates();
      if (res?.data?.length > 0) {
        const data = res.data[0];
        setExistingData(data);
        setValue("pfDay", data.pfDay);
        setValue("gstDay", data.gstDay);
        setValue("ptDay", data.ptDay);
        setValue("tdsDay", data.tdsDay);
      }
    } catch (err) {
      console.error("Failed to fetch due dates:", err);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (existingData) {
        await patchDueDatesById({ ...data, id: existingData.id });
        alert("Updated Successfully");
      } else {
        await postDueDates(data);
        alert("Added Successfully");
      }
      fetchDueDates();
    } catch (err) {
      alert("Error saving data");
    }
  };

  const confirmAction = (type) => {
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (actionType === "delete" && existingData?.id) {
      await deleteDueDatesById(existingData.id);
      alert("Deleted successfully");
      setExistingData(null);
    }
    setShowModal(false);
    fetchDueDates();
  };

  const renderDayOptions = () =>
    Array.from({ length: 31 }, (_, i) => {
      const day = (i + 1).toString().padStart(2, "0");
      return (
        <option key={day} value={day} disabled={disableDays.includes(day)}>
          {day}
        </option>
      );
    });
  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3">
            <strong>TimeLines</strong>{" "}
          </h1>
        </div>
        <div className="col-auto">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/main" className="custom-link">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active">
                <a href="/AddEvent">TimeLines</a>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-header">➕ Add TimeLine</div>
        <div className="card-body">
          <h4 className="text-center mb-4">Add Due Dates</h4>
       <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row mb-3">
          <div className="col-md-3">
            <label>PF Day</label>
            <select className="form-control" {...register("pfDay")} required>
              <option value="">Select Day</option>
              {renderDayOptions()}
            </select>
          </div>
          <div className="col-md-3">
            <label>GST Day</label>
            <select className="form-control" {...register("gstDay")} required>
              <option value="">Select Day</option>
              {renderDayOptions()}
            </select>
          </div>
          <div className="col-md-3">
            <label>PT Day</label>
            <select className="form-control" {...register("ptDay")} required>
              <option value="">Select Day</option>
              {renderDayOptions()}
            </select>
          </div>
          <div className="col-md-3">
            <label>TDS Day</label>
            <select className="form-control" {...register("tdsDay")} required>
              <option value="">Select Day</option>
              {renderDayOptions()}
            </select>
          </div>
        </div>

        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-success">
            {existingData ? "Update Due Dates" : "Add Due Dates"}
          </button>

          {existingData && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => confirmAction("delete")}
            >
              Delete Due Dates
            </button>
          )}
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm {actionType === "delete" ? "Deletion" : "Action"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {actionType} the due dates?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Yes, Confirm
          </Button>
        </Modal.Footer>
      </Modal>
        </div>
      </div>
    </LayOut>
  );
};

export default TimeLineDates;

// import React from "react";
// import { useForm, useFieldArray, useWatch } from "react-hook-form";
// import axios from "axios";
// import LayOut from "../../../LayOut/LayOut";

// const FORMATS = ["PF", "PT", "TDS", "GST"];
// const TIMELINE_MODES = [
//   { value: "Monthly", hint: "Any month" },
//   { value: "Quarterly", hint: "Any month" },
//   { value: "Half-Yearly", hint: "Any month" },
//   { value: "Yearly", hint: "Any month" },
// ];

// export default function TimelineForm() {
//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       timelines: FORMATS.map((format) => ({
//         format,
//         timelineMode: "",
//         timeLineDate: "",
//       })),
//     },
//   });

//   const { fields } = useFieldArray({ control, name: "timelines" });
//   const watchTimelines = useWatch({ control, name: "timelines" });

//   const onSubmit = async (data) => {
//     const payload = data.timelines.reduce((acc, item) => {
//       const [year, month, date] = item.timeLineDate.split("-");
//       acc[item.format] = [
//         {
//           timelineMode: item.timelineMode,
//           timeLineDate: {
//             year,
//             month,
//             date,
//           },
//         },
//       ];
//       return acc;
//     }, {});

//     console.log("✅ Payload to send:", payload);

//     try {
//       const response = await axios.post("http://your-server.com/api/timelines", payload);
//       alert("✅ Timeline submitted successfully!");
//     } catch (error) {
//       console.error("❌ Submission failed:", error);
//       alert("❌ Failed to submit timeline");
//     }
//   };

//   return (
//     <LayOut>
//       <div className="container">
//         <h2>Timeline Dates Setup</h2>
//         <p className="text-muted">
//             Set up timelines for PF, PT, TDS, and GST. Each format requires a timeline mode and a start date.
//         </p>
//         <p className="text-muted">
//             Ensure to select the correct timeline mode and provide a valid start date for each format.
//         </p>
//         </div>

//         <div className="container">
//             <div className="row">
//                 <div className="col-md-12">
//     <form onSubmit={handleSubmit(onSubmit)} className="container mt-4">
//       <h3>Timeline Setup</h3>

//       {fields.map((field, index) => {
//         const watchRow = watchTimelines?.[index] || {};

//         return (
//           <div key={field.id} className="card p-3 mb-4">
//             <h5>{field.format}</h5>
//             <div className="row">
//               {/* Timeline Mode */}
//               <div className="col-md-6 mb-3">
//                 <label>Timeline Mode</label>
//                 <select
//                   className="form-control"
//                   {...register(`timelines.${index}.timelineMode`, {
//                     required: "Timeline mode is required",
//                   })}
//                 >
//                   <option value="">-- Select --</option>
//                   {TIMELINE_MODES.map((m) => (
//                     <option key={m.value} value={m.value}>
//                       {m.value}
//                     </option>
//                   ))}
//                 </select>
//                 <small className="form-text text-muted">
//                   {watchRow.timelineMode &&
//                     TIMELINE_MODES.find((m) => m.value === watchRow.timelineMode)?.hint}
//                 </small>
//                 {errors.timelines?.[index]?.timelineMode && (
//                   <span className="text-danger">
//                     {errors.timelines[index].timelineMode.message}
//                   </span>
//                 )}
//               </div>

//               {/* Start Date */}
//               <div className="col-md-6 mb-3">
//                 <label>Time Line Date</label>
//                 <input
//                   type="date"
//                   className="form-control"
//                   {...register(`timelines.${index}.timeLineDate`, {
//                     required: "Start date is required",
//                   })}
//                 />
//                 <small className="form-text text-muted">Any date allowed</small>
//                 {errors.timelines?.[index]?.timeLineDate && (
//                   <span className="text-danger">
//                     {errors.timelines[index].timeLineDate.message}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}

//       <button type="submit" className="btn btn-primary">Submit Timeline</button>
//     </form>
//                 </div>
//             </div>
//         </div>
//     </LayOut>
//   );
// }
