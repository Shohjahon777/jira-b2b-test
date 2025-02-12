/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface MultiSelectProps {
	options: { label: string; value: string }[];
	selectedValues: string | string[];
	onChange: (values: string[]) => void;
}

export function MultiSelectAssignees({
	                                     options,
	                                     selectedValues,
	                                     onChange,
                                     }: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	// Normalize selectedValues to always be an array
	const selectedArray = Array.isArray(selectedValues)
		? selectedValues
		: selectedValues
			? [selectedValues]
			: [];

	const handleSelect = (value: string) => {
		const updatedValues = selectedArray.includes(value)
			? selectedArray.filter((val) => val !== value)
			: [...selectedArray, value];
		onChange(updatedValues);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-between min-h-[48px] overflow-hidden"
				>
					<div className="flex flex-wrap gap-1 max-w-[80%] overflow-y-auto max-h-[60px]">
						{selectedArray.length > 0 ? (
							selectedArray.map((val) => {
								const selectedOption = options.find((opt) => opt.value === val);
								return selectedOption ? (
									<Badge key={val} variant="secondary" className="px-2">
										{selectedOption.label}
									</Badge>
								) : null;
							})
						) : (
							<span className="text-gray-400">Select assignees</span>
						)}
					</div>
					<ChevronDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-[270px] p-0 max-h-[250px] overflow-y-auto">
				<Command>
					<CommandInput
						placeholder="Search assignees..."
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList className="max-h-[200px] overflow-y-auto">
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedArray.includes(option.value);
								return (
									<CommandItem
										key={option.value}
										onSelect={() => handleSelect(option.value)}
										className="cursor-pointer flex items-center"
									>
										<div
											className={cn(
												"mr-2 flex h-5 w-5 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible"
											)}
										>
											<Check />
										</div>
										{option.label}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
