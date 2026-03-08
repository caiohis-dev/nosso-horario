import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'

interface DropzoneProps {
    onFileAccepted: (file: File) => void
    acceptedFileTypes?: string[]
    maxSizeMB?: number
    title?: string
    description?: string
}

export function Dropzone({
    onFileAccepted,
    acceptedFileTypes = ['.xlsx', '.xls', '.csv'],
    maxSizeMB = 5,
    title = 'Clique ou arraste a planilha aqui',
    description = 'Arquivos suportados: .xlsx, .xls ou .csv (Máx. 5MB)'
}: DropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false)

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isDragActive) {
            setIsDragActive(true)
        }
    }, [isDragActive])

    const validateAndProcessFile = (file: File) => {
        // Validações básicas (tamanho / tipo bruto)
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`Arquivo muito grande! O máximo permitido é ${maxSizeMB}MB`)
            return
        }

        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        if (!acceptedFileTypes.includes(extension)) {
            toast.error(`Formato inválido. Envie apenas arquivos do tipo: ${acceptedFileTypes.join(', ')}`)
            return
        }

        onFileAccepted(file)
    }

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0]
            validateAndProcessFile(file)
        }
    }, [maxSizeMB, acceptedFileTypes, onFileAccepted])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            validateAndProcessFile(file)
        }
    }, [maxSizeMB, acceptedFileTypes, onFileAccepted])

    return (
        <div
            className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${isDragActive
                ? 'border-brand bg-brand/5 ring-4 ring-brand/10'
                : 'border-border-subtle bg-surface hover:border-brand/50 hover:bg-surface-overlay'
                }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                accept={acceptedFileTypes.join(',')}
                onChange={handleFileInput}
                title=""
            />

            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-300 ${isDragActive ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-surface-raised text-brand-muted ring-1 ring-border-subtle'}`}>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>

            <h3 className={`text-lg font-semibold transition-colors duration-300 ${isDragActive ? 'text-brand' : 'text-text-primary'}`}>
                {title}
            </h3>

            <p className="mt-2 text-sm text-text-muted">
                {description}
            </p>
        </div>
    )
}
