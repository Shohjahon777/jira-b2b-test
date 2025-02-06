import {
    addMonths,
    format,
    getDay,
    parse,
    startOfWeek,
    subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";
import { EventCard } from "./event-card";
import {CustomToolbar} from "@/components/resuable/custom-toolbar.tsx";
import {TaskType} from "@/types/api.type.ts";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface DataCalendarProps {
    data: TaskType[];
}

export const DataCalendar = ({ data }: DataCalendarProps) => {
    const [value, setValue] = useState(
        data.length > 0 ? new Date(data[0].dueDate) : new Date()
    );

    const events = Array.isArray(data)
        ? data.map((task) => ({
            start: new Date(task.dueDate),
            end: new Date(task.dueDate),
            title: task.title,
            assignedTo: task.assignedTo,
            status: task.status,
            id: task._id,
        }))
        : [];

    const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
        if (action === "PREV") {
            setValue(subMonths(value, 1));
        } else if (action === "NEXT") {
            setValue(addMonths(value, 1));
        } else {
            setValue(new Date());
        }
    };

    console.log("Events: ", events);

    return (
        <Calendar
            localizer={localizer}
            date={value}
            events={events}
            views={["month"]}
            defaultView="month"
            toolbar
            showAllEvents
            className="h-full"
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
            formats={{
                weekdayFormat: (date, culture, localizer) =>
                    localizer?.format(date, "EEEE", culture) ?? "",
            }}
            components={{
                eventWrapper: ({ event }) => (
                    <EventCard
                        // id={event.id}
                        title={event.title}
                        assignedTo={event.assignedTo}
                        status={event.status}
                    />
                ),
                toolbar: () => (
                    <CustomToolbar date={value} onNavigate={handleNavigate} />
                ),
            }}
        />
    );
};
