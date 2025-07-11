import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import axios from "axios";
import LayOut from "../../../LayOut/LayOut";

const FORMATS = ["PF", "PT", "TDS", "GST"];
const TIMELINE_MODES = [
  { value: "Monthly", hint: "Any month" },
  { value: "Quarterly", hint: "Any month" },
  { value: "Half-Yearly", hint: "Any month" },
  { value: "Yearly", hint: "Any month" },
];

export default function TimelineForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      timelines: FORMATS.map((format) => ({
        format,
        timelineMode: "",
        timeLineDate: "",
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: "timelines" });
  const watchTimelines = useWatch({ control, name: "timelines" });

  const onSubmit = async (data) => {
    const payload = data.timelines.reduce((acc, item) => {
      const [year, month, date] = item.timeLineDate.split("-");
      acc[item.format] = [
        {
          timelineMode: item.timelineMode,
          timeLineDate: {
            year,
            month,
            date,
          },
        },
      ];
      return acc;
    }, {});

    console.log("✅ Payload to send:", payload);

    try {
      const response = await axios.post("http://your-server.com/api/timelines", payload);
      alert("✅ Timeline submitted successfully!");
    } catch (error) {
      console.error("❌ Submission failed:", error);
      alert("❌ Failed to submit timeline");
    }
  };

  return (
    <LayOut>
      <div className="container">       
        <h2>Timeline Dates Setup</h2>
        <p className="text-muted">
            Set up timelines for PF, PT, TDS, and GST. Each format requires a timeline mode and a start date.
        </p>
        <p className="text-muted">
            Ensure to select the correct timeline mode and provide a valid start date for each format.
        </p>
        </div>

        <div className="container">
            <div className="row">
                <div className="col-md-12"> 
    <form onSubmit={handleSubmit(onSubmit)} className="container mt-4">
      <h3>Timeline Setup</h3>

      {fields.map((field, index) => {
        const watchRow = watchTimelines?.[index] || {};

        return (
          <div key={field.id} className="card p-3 mb-4">
            <h5>{field.format}</h5>
            <div className="row">
              {/* Timeline Mode */}
              <div className="col-md-6 mb-3">
                <label>Timeline Mode</label>
                <select
                  className="form-control"
                  {...register(`timelines.${index}.timelineMode`, {
                    required: "Timeline mode is required",
                  })}
                >
                  <option value="">-- Select --</option>
                  {TIMELINE_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.value}
                    </option>
                  ))}
                </select>
                <small className="form-text text-muted">
                  {watchRow.timelineMode &&
                    TIMELINE_MODES.find((m) => m.value === watchRow.timelineMode)?.hint}
                </small>
                {errors.timelines?.[index]?.timelineMode && (
                  <span className="text-danger">
                    {errors.timelines[index].timelineMode.message}
                  </span>
                )}
              </div>

              {/* Start Date */}
              <div className="col-md-6 mb-3">
                <label>Time Line Date</label>
                <input
                  type="date"
                  className="form-control"
                  {...register(`timelines.${index}.timeLineDate`, {
                    required: "Start date is required",
                  })}
                />
                <small className="form-text text-muted">Any date allowed</small>
                {errors.timelines?.[index]?.timeLineDate && (
                  <span className="text-danger">
                    {errors.timelines[index].timeLineDate.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button type="submit" className="btn btn-primary">Submit Timeline</button>
    </form>
                </div>
            </div>
        </div>  
    </LayOut>       
  );
}
