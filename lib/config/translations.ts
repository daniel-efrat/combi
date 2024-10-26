interface Translations {
  [key: string]: {
    uploadTab: string
    urlTab: string
    recordTab: string
    selectLanguage: string
    dragAndDrop: string
    selectFile: string
    uploading: string
    transcribing: string
    supportedFormats: string
    fullTranscription: string
    segments: string
    copyToClipboard: string
    downloadAsTxt: string
    downloadAsSrt: string
    urlUploadSoon: string
    recordingSoon: string
    pleaseSelectLanguage: string
    errorTitle: string
    fileTooLarge: string
    maxFileSize: string
    processingLargeFiles: string
    analyzing: string
    compressing: string
    splitting: string
    processing: string
    mergingResults: string
  }
}

export const translations: Translations = {
  en: {
    uploadTab: "Upload",
    urlTab: "URL",
    recordTab: "Record",
    selectLanguage: "Select language",
    dragAndDrop: "Drag & drop or click to upload audio file",
    selectFile: "Select File",
    uploading: "Uploading...",
    transcribing: "Transcribing...",
    supportedFormats: "Supports MP3, WAV, M4A, WEBM, MP4, MPGA, WAV, MOV, AVI",
    fullTranscription: "Full Transcription",
    segments: "Segments",
    copyToClipboard: "Copy to clipboard",
    downloadAsTxt: "Download as TXT",
    downloadAsSrt: "Download as SRT",
    urlUploadSoon: "URL upload coming soon",
    recordingSoon: "Recording feature coming soon",
    pleaseSelectLanguage: "Please select a language first",
    errorTitle: "Error",
    fileTooLarge: "File size exceeds 25MB limit. Please upload a smaller file.",
    maxFileSize: "Maximum file size: 25MB",
    processingLargeFiles:
      "Large files will be automatically split for processing",
    analyzing: "Analyzing file...",
    compressing: "Compressing audio...",
    splitting: "Splitting into chunks...",
    transcribing: "Transcribing audio...",
    processing: "Processing chunk",
    mergingResults: "Merging results...",
  },
  he: {
    uploadTab: "העלאה",
    urlTab: "קישור",
    recordTab: "הקלטה",
    selectLanguage: "בחר שפה",
    dragAndDrop: "גרור ושחרר או לחץ להעלאת קובץ שמע",
    selectFile: "בחר קובץ",
    uploading: "מעלה...",
    transcribing: "מתמלל...",
    supportedFormats: "תומך ב-MP3, WAV, M4A, WEBM, MP4, MPGA, WAV, MOV, AVI",
    fullTranscription: "תמלול מלא",
    segments: "מקטעים",
    copyToClipboard: "העתק ללוח",
    downloadAsTxt: "הורד כ-TXT",
    downloadAsSrt: "הורד כ-SRT",
    urlUploadSoon: "העלאה מקישור תהיה זמינה בקרוב",
    recordingSoon: "הקלטה תהיה זמינה בקרוב",
    pleaseSelectLanguage: "אנא בחר שפה תחילה",
    errorTitle: "שגיאה",
    fileTooLarge: "גודל הקובץ עולה על 25MB. אנא העלה קובץ קטן יותר.",
    maxFileSize: "גודל קובץ מקסימלי: 25MB",
    processingLargeFiles: "קבצים גדולים יחולקו אוטומטית לעיבוד",
    analyzing: "מנתח קובץ...",
    compressing: "דוחס שמע...",
    splitting: "מפצל לחלקים...",
    transcribing: "מתמלל שמע...",
    processing: "מעבד חלק",
    mergingResults: "ממזג תוצאות...",
  },
  ar: {
    uploadTab: "تحميل",
    urlTab: "رابط",
    recordTab: "تسجيل",
    selectLanguage: "اختر اللغة",
    dragAndDrop: "اسحب وأفلت أو انقر لتحميل ملف صوتي",
    selectFile: "اختر ملف",
    uploading: "جاري التحميل...",
    transcribing: "جاري النسخ...",
    supportedFormats: "يدعم MP3, WAV, M4A, WEBM, MP4, MPGA, WAV, MOV, AVI",
    fullTranscription: "النص الكامل",
    segments: "المقاطع",
    copyToClipboard: "نسخ إلى الحافظة",
    downloadAsTxt: "تنزيل كملف TXT",
    downloadAsSrt: "تنزيل كملف SRT",
    urlUploadSoon: "التحميل عبر الرابط قريباً",
    recordingSoon: "ميزة التسجيل قريباً",
    pleaseSelectLanguage: "الرجاء اختيار اللغة أولاً",
    errorTitle: "خطأ",
    fileTooLarge: "حجم الملف يتجاوز 25 ميجابايت. يرجى تحميل ملف أصغر.",
    maxFileSize: "الحد الأقصى لحجم الملف: 25 ميجابايت",
    processingLargeFiles: "سيتم تقسيم الملفات الكبيرة تلقائياً للمعالجة",
    analyzing: "تحليل الملف...",
    compressing: "ضغط الصوت...",
    splitting: "تقسيم إلى أجزاء...",
    transcribing: "نسخ الصوت...",
    processing: "معالجة الجزء",
    mergingResults: "دمج النتائج...",
  },
  // Add more languages as needed
}

export function getTranslation(
  language: string,
  key: keyof Translations["en"]
): string {
  return translations[language]?.[key] || translations["en"][key]
}
