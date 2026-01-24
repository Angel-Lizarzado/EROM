'use client';

import { useState } from 'react';
import { Link2, Loader2, CheckCircle, AlertCircle, Download, X, Package, ExternalLink, ChevronLeft, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react';
import { scrapeProductFromUrl, importProductFromScrape } from '@/actions/alibaba-scraper';

interface Category {
    id: number;
    name: string;
}

interface ScrapedData {
    title: string;
    description: string;
    details: string;
    price: number;
    images: string[];
    videos: string[];
    attributes: Record<string, string>;
    source: 'aliexpress' | 'alibaba' | 'unknown';
}

interface AdminAlibabaImporterProps {
    categories: Category[];
    onProductImported: () => Promise<void>;
}

export default function AdminAlibabaImporter({ categories, onProductImported }: AdminAlibabaImporterProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number>(categories[0]?.id || 0);
    const [customPrice, setCustomPrice] = useState<string>('');
    const [customName, setCustomName] = useState<string>('');
    const [customDescription, setCustomDescription] = useState<string>('');
    const [importSuccess, setImportSuccess] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [editableImages, setEditableImages] = useState<string[]>([]);
    const [editableVideos, setEditableVideos] = useState<string[]>([]);

    const handleScrape = async () => {
        if (!url.trim()) {
            setError('Por favor ingresa una URL');
            return;
        }

        setLoading(true);
        setError(null);
        setScrapedData(null);
        setImportSuccess(false);
        setCurrentImageIndex(0);

        const result = await scrapeProductFromUrl(url);

        if (result.success && result.data) {
            setScrapedData(result.data);
            setEditableImages(result.data.images || []);
            setEditableVideos(result.data.videos || []);
            setCustomPrice(result.data.price?.toString() || '');
            setCustomName(result.data.title || '');
            setCustomDescription(result.data.description || '');
        } else {
            setError(result.error || 'Error desconocido');
        }

        setLoading(false);
    };

    const removeImage = (indexToRemove: number) => {
        setEditableImages(prev => prev.filter((_, i) => i !== indexToRemove));
        if (currentImageIndex >= indexToRemove && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const removeVideo = (indexToRemove: number) => {
        setEditableVideos(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleImport = async () => {
        if (!scrapedData || !selectedCategory) return;

        setLoading(true);
        setError(null);

        const result = await importProductFromScrape(
            { ...scrapedData, images: editableImages, videos: editableVideos, description: customDescription },
            selectedCategory,
            customPrice ? parseFloat(customPrice) : undefined,
            customName || undefined,
            customDescription || undefined
        );

        if (result.success) {
            setImportSuccess(true);
            setScrapedData(null);
            setEditableImages([]);
            setUrl('');
            setCustomPrice('');
            setCustomName('');
            setCustomDescription('');
            await onProductImported();
        } else {
            setError(result.error || 'Error al importar');
        }

        setLoading(false);
    };

    const handleReset = () => {
        setUrl('');
        setScrapedData(null);
        setError(null);
        setImportSuccess(false);
        setCustomPrice('');
        setCustomName('');
        setCustomDescription('');
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        if (scrapedData && currentImageIndex < scrapedData.images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-text-main flex items-center gap-2">
                        Importar Producto
                        <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-medium">BETA</span>
                    </h3>
                    <p className="text-sm text-text-muted">Pega URL de AliExpress o Alibaba</p>
                </div>
            </div>

            {/* Success Message */}
            {importSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="text-green-800 font-medium">¡Producto importado!</p>
                        <p className="text-green-600 text-sm">Ya puedes verlo en el inventario</p>
                    </div>
                    <button onClick={handleReset} className="ml-auto text-green-600 hover:text-green-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* URL Input */}
            {!scrapedData && !importSuccess && (
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.aliexpress.com/item/... o https://www.alibaba.com/..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-orange-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                    <button
                        onClick={handleScrape}
                        disabled={loading || !url.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Extrayendo...
                            </>
                        ) : (
                            <>
                                <Package className="h-5 w-5" />
                                Extraer
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-red-800 font-medium">Error al extraer datos</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Scraped Data Preview */}
            {scrapedData && (
                <div className="mt-4 space-y-4">
                    <div className="bg-white rounded-xl border border-orange-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-text-main">Datos Extraídos</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-muted flex items-center gap-1">
                                    <ImageIcon className="h-3 w-3" />
                                    {scrapedData.images.length} imágenes
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${scrapedData.source === 'aliexpress'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {scrapedData.source === 'aliexpress' ? 'AliExpress' : 'Alibaba'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Media Gallery (Images + Videos) */}
                            <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group">
                                    {(() => {
                                        const allMedia = [
                                            ...editableImages.map(url => ({ type: 'image' as const, url })),
                                            ...editableVideos.map(url => ({ type: 'video' as const, url }))
                                        ];
                                        const currentMedia = allMedia[currentImageIndex] || allMedia[0];

                                        if (!currentMedia) {
                                            return (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                    <Package className="h-16 w-16 opacity-30" />
                                                </div>
                                            );
                                        }

                                        return (
                                            <>
                                                {currentMedia.type === 'video' ? (
                                                    <video
                                                        src={currentMedia.url}
                                                        controls
                                                        className="w-full h-full object-contain bg-black"
                                                        // @ts-ignore
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    <img
                                                        src={currentMedia.url}
                                                        alt={`Media ${currentImageIndex + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Sin+Imagen';
                                                        }}
                                                    />
                                                )}

                                                {/* Navigation arrows (only if multiple) */}
                                                {allMedia.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                                                            disabled={currentImageIndex === 0}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/70 transition-colors z-10"
                                                        >
                                                            <ChevronLeft className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setCurrentImageIndex(prev => Math.min(allMedia.length - 1, prev + 1))}
                                                            disabled={currentImageIndex === allMedia.length - 1}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/70 transition-colors z-10"
                                                        >
                                                            <ChevronRight className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Counter */}
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10">
                                                    {currentImageIndex + 1} / {allMedia.length}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Thumbnails Unified */}
                                {(() => {
                                    const allMedia = [
                                        ...editableImages.map((url, i) => ({ type: 'image' as const, url, originalIndex: i })),
                                        ...editableVideos.map((url, i) => ({ type: 'video' as const, url, originalIndex: i }))
                                    ];

                                    if (allMedia.length === 0) return null;

                                    return (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-text-muted">Multimedia ({allMedia.length})</span>
                                                <span className="text-xs text-text-muted">Video = <span className="inline-block w-2 h-2 bg-black rounded-full align-middle mx-1"></span></span>
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                                {allMedia.map((media, index) => (
                                                    <div key={index} className="relative flex-shrink-0 group">
                                                        <button
                                                            onClick={() => setCurrentImageIndex(index)}
                                                            className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-orange-500' : 'border-transparent hover:border-orange-300'}`}
                                                        >
                                                            {media.type === 'video' ? (
                                                                <div className="w-full h-full bg-black flex items-center justify-center">
                                                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                                        <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5"></div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <img
                                                                    src={media.url}
                                                                    alt={`Thumb ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (media.type === 'image') removeImage(media.originalIndex);
                                                                else removeVideo(media.originalIndex);
                                                                // Adjust index if we removed the current one or one before it
                                                                if (index <= currentImageIndex && currentImageIndex > 0) {
                                                                    setCurrentImageIndex(prev => prev - 1);
                                                                }
                                                            }}
                                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-colors z-20"
                                                            title={`Eliminar ${media.type === 'image' ? 'imagen' : 'video'}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="space-y-3">
                                {/* Editable Title */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Nombre del producto</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-none text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>

                                {/* Editable Description - DENTRO DE LA MISMA SECCIÓN */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Descripción del producto
                                    </label>
                                    <textarea
                                        value={customDescription}
                                        onChange={(e) => setCustomDescription(e.target.value)}
                                        placeholder="Pega aquí la descripción completa desde AliExpress (Información del producto, Descripción, Lista de productos, etc.)"
                                        rows={5}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-y"
                                    />
                                    <p className="text-xs text-text-muted mt-1">
                                        💡 Copia desde AliExpress: "Información del producto" + "Descripción"
                                    </p>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase">Precio detectado</label>
                                    <p className="text-lg font-bold text-green-600">
                                        {scrapedData.price > 0 ? `$${scrapedData.price.toFixed(2)}` : 'No detectado'}
                                    </p>
                                </div>

                                {/* Details/Specs (if any) */}
                                {scrapedData.details && (
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase">Especificaciones detectadas</label>
                                        <p className="text-xs text-text-muted line-clamp-4 mt-1 whitespace-pre-line bg-gray-50 p-2 rounded">{scrapedData.details}</p>
                                    </div>
                                )}

                                {/* Source Link */}
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver original (copiar descripción de aquí)
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Import Options */}
                    <div className="bg-white rounded-xl border border-orange-200 p-4">
                        <h4 className="font-bold text-text-main mb-3">Opciones de Importación</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Categoría</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-lg bg-background border-none text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Price */}
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Tu Precio de Venta (USD)</label>
                                <input
                                    type="number"
                                    value={customPrice}
                                    onChange={(e) => setCustomPrice(e.target.value)}
                                    placeholder="Ej: 25.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background border-none text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <p className="text-xs text-text-muted mt-3">
                            Se importarán <strong>{scrapedData.images.length}</strong> imágenes del producto
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleReset}
                                className="flex-1 py-3 px-4 rounded-xl text-center text-sm font-bold text-text-muted hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={loading || !selectedCategory || !customPrice}
                                className="flex-1 py-3 px-4 rounded-xl text-center text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Importar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
