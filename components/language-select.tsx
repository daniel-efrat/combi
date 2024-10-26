"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Language, languages } from "@/lib/config/languages"

interface LanguageSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function LanguageSelect({ value, onValueChange }: LanguageSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.nativeName} ({language.name})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
