import { useState, useCallback } from 'react'
import * as xlsx from 'xlsx'
import { toast } from 'sonner'

export interface ExcelRowError {
    row: number
    errors: string[]
}

export interface ParseResult {
    headers: string[]
    data: any[] // Lista pura de objetos cujas chaves são os headers do excel
    errors: ExcelRowError[]
    totalRows: number
}

export function useExcelParser() {
    const [isParsing, setIsParsing] = useState(false)
    const [parseResult, setParseResult] = useState<ParseResult | null>(null)

    const parseExcel = useCallback((file: File) => {
        setIsParsing(true)
        setParseResult(null)

        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                if (!data) throw new Error('Falha ao ler o arquivo')

                // Parse the workbook
                const workbook = xlsx.read(data, { type: 'binary' })

                // Pega a primeira aba
                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]

                // Converte para JSON bruto (array de arrays primeiro para checar cabecalhos)
                const rawJson = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

                if (rawJson.length < 2) {
                    throw new Error('A planilha parece estar vazia ou sem linhas de dados.')
                }

                // Extrai cabeçalhos literais da primeira linha
                const headers = rawJson[0]?.map((h: any) => String(h).trim()) || []

                // Converte para json com as keys literais do excel
                const objectJson = xlsx.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[]

                setParseResult({
                    headers,
                    data: objectJson,
                    errors: [],
                    totalRows: objectJson.length
                })

            } catch (error: any) {
                console.error("Excel parse error:", error)
                toast.error(error.message || 'Erro ao processar a planilha. Verifique se o formato é válido.')
                setParseResult(null)
            } finally {
                setIsParsing(false)
            }
        }

        reader.onerror = () => {
            toast.error('Ocorreu um erro ao tentar ler o arquivo físico.')
            setIsParsing(false)
        }

        reader.readAsBinaryString(file)
    }, [])

    const resetParser = useCallback(() => {
        setParseResult(null)
        setIsParsing(false)
    }, [])

    return {
        isParsing,
        parseResult,
        parseExcel,
        resetParser
    }
}
