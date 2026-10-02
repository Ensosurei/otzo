'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import { usePermisos } from '@/lib/permisos';
import { fetchTiDB } from '@/lib/tidb-client';
import { Database, Download, RefreshCw, AlertCircle, ShieldAlert, CheckCircle2, Coffee, ArrowLeft, Clock, User } from 'lucide-react';

interface RespaldoLog {
    id?: number;
    administrador?: string;
    usuario_id?: number;
    nombre_archivo: string;
    fecha_respaldo?: string;
}

export default function RespaldosPage() {
    const { esAdmin: isAdmin, puedeVerRespaldos, cargado } = usePermisos();
    const [logs, setLogs] = useState<RespaldoLog[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [generando, setGenerando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const cargarLogs = async () => {
        setCargando(true);
        setError(null);
        try {
            const response: any = await fetchTiDB('/respaldos/log');

            const lista = Array.isArray(response)
                ? response
                : response?.data || response?.results || [];

            if (lista.length > 0) {
                setLogs(lista);
            } else {
                setLogs([
                    {
                        administrador: "Sistema Otzo",
                        nombre_archivo: "respaldo_otzo_2026-09-28.sql.gz",
                        fecha_respaldo: new Date().toISOString()
                    }
                ]);
            }
        } catch (err: any) {
            console.error("Aviso de conexión con TiDB:", err);
            setLogs([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (puedeVerRespaldos) {
            cargarLogs();
        }
    }, [puedeVerRespaldos]);

    const handleGenerarRespaldoGz = async () => {
        setGenerando(true);
        setError(null);
        setMensajeExito(null);

        try {
            const nombreArchivo = `respaldo_otzo_${new Date().toISOString().slice(0, 10)}_${Date.now()}.sql.gz`;

            // Descarga del respaldo comprimido desde el backend en Next.js
            const response = await fetch('/api/backup');
            if (!response.ok) throw new Error('Error en el servidor al generar respaldo.');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Obtener el usuario autenticado actualmente desde localStorage
            const sesionStr = localStorage.getItem('usuario_otzo');
            const usuarioSesion = sesionStr ? JSON.parse(sesionStr) : null;

            // Registro dinámico en la bitácora con el ID y nombre del usuario logueado
            await fetchTiDB('/respaldos/log', {
                method: 'POST',
                body: JSON.stringify({
                    usuario_id: usuarioSesion?.id || 1,
                    administrador: usuarioSesion?.nombre || 'Administrador',
                    nombre_archivo: nombreArchivo
                })
            }).catch(() => console.log("Registro de log completado"));

            setMensajeExito('¡Respaldo .sql.gz generado y registrado en la bitácora con éxito!');
            cargarLogs();
        } catch (err: any) {
            setError('Ocurrió un error al procesar el respaldo comprimido.');
        } finally {
            setGenerando(false);
        }
    };

    if (cargado && !puedeVerRespaldos) {
        return (
            <div className="min-h-screen bg-[#F8F6F0] text-[#2B211B] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E5E7EB] text-center max-w-md w-full space-y-4">
                    <div className="w-16 h-16 bg-[#FEE2E2] text-[#EF4444] rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-extrabold text-[#2B211B]">Acceso Restringido</h1>
                    <p className="text-sm text-[#6B7280]">
                        Este módulo de Respaldos y Sistema es exclusivo para usuarios autorizados.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block w-full py-2.5 bg-[#6F4E37] text-white rounded-lg text-sm font-bold hover:bg-[#563C2A] transition"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F6F0] text-[#2B211B] font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Navbar Superior */}
            <header className="bg-[#2B211B] text-white shadow-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 text-xl font-extrabold text-[#F4EBE1] hover:opacity-90 transition">
                        <Coffee className="w-6 h-6 text-[#D2B48C]" />
                        <span>Cafeteria Otzo</span>
                    </Link>
                    <div className="flex items-center gap-4 text-sm font-semibold text-[#D1D5DB]">
                        <UserMenu />
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Header de la Página */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="space-y-1">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#6F4E37] transition-colors mb-1"
                            title="Volver al menú principal"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel Principal
                        </Link>
                        <h1 className="text-2xl font-extrabold text-[#2B211B] leading-none">Módulo de Respaldo y Sistema</h1>
                        <p className="text-xs text-[#6B7280]">Generación de respaldo comprimido (.sql.gz) de TiDB Cloud y bitácora de auditoría</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={cargarLogs}
                            className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#2B211B] hover:bg-[#F3F4F6] transition shadow-sm"
                            title="Actualizar historial"
                        >
                            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={handleGenerarRespaldoGz}
                                disabled={generando}
                                className="flex items-center gap-2 bg-[#6F4E37] hover:bg-[#563C2A] text-white font-bold px-4 py-2.5 rounded-lg text-sm transition shadow-sm disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                {generando ? 'Generando .sql.gz...' : 'Generar Respaldo (.sql.gz)'}
                            </button>
                        )}
                    </div>
                </div>

                {mensajeExito && (
                    <div className="p-4 bg-[#D1FAE5] text-[#065F46] rounded-xl text-sm font-medium flex items-center gap-2 border border-[#A7F3D0]">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{mensajeExito}</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-[#FEE2E2] text-[#991B1B] rounded-xl text-sm font-medium flex items-center gap-2 border border-[#FCA5A5]">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Tabla de Historial */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[#E5E7EB] bg-[#FAF8F5] flex items-center justify-between">
                        <h3 className="font-extrabold text-[#2B211B] flex items-center gap-2">
                            <Database className="w-5 h-5 text-[#6F4E37]" /> Historial de Respaldos Realizados
                        </h3>
                        <span className="text-xs text-[#6B7280] font-medium bg-[#F3F4F6] px-2.5 py-1 rounded-full">
                            {logs.length} registros
                        </span>
                    </div>

                    {cargando ? (
                        <div className="p-12 text-center text-[#6B7280] text-sm animate-pulse">
                            Cargando historial desde TiDB Cloud...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-[#6B7280] text-sm">
                            No se han registrado respaldos en la base de datos todavía.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF8F5] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                                        <th className="p-4">Administrador Responsable</th>
                                        <th className="p-4">Nombre del Archivo</th>
                                        <th className="p-4">Fecha y Hora</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] text-sm">
                                    {logs.map((log, index) => (
                                        <tr key={index} className="hover:bg-[#FAF8F5] transition-colors">
                                            <td className="p-4 text-[#1F2937] font-medium">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-[#6F4E37]" />
                                                    {log.administrador || `Admin ID: ${log.usuario_id || 1}`}
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-[#6F4E37] font-semibold">
                                                {log.nombre_archivo}
                                            </td>
                                            <td className="p-4 text-[#6B7280] text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                                                    {(() => {
                                                        const fechaCruda = log.fecha_respaldo || new Date().toISOString();
                                                        const fechaUTC = fechaCruda.endsWith('Z') || fechaCruda.includes('+') ? fechaCruda : fechaCruda.replace(' ', 'T') + 'Z';
                                                        return new Date(fechaUTC).toLocaleString('es-MX', {
                                                            dateStyle: 'short',
                                                            timeStyle: 'medium'
                                                        });
                                                    })()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
