"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, MapPin, Building2, Check, ChevronRight, ChevronLeft, 
  Plus, Trash, Upload, Camera, AlertCircle, Eye, ShieldCheck 
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

// Types matching database structures
interface City {
  id: string;
  name: string;
}

interface Locality {
  id: string;
  name: string;
  cityId: string;
}

interface Amenity {
  id: string;
  name: string;
  icon: string | null;
}

interface UploadedImage {
  url: string;
  publicId: string | null;
  category: string;
  isPrimary: boolean;
  sortOrder: number;
}

export default function AddPropertyPage() {
  const router = useRouter();

  // Loading states
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<boolean>(false);
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Wizard state
  const [step, setStep] = useState(1);

  // Complete 12-step form state
  const [formData, setFormData] = useState({
    // Step 1: Transaction Type
    transactionType: "RENT", // RENT, SALE, LEASE
    saleType: "FULL_HOUSE", // FULL_HOUSE, FLOOR_WISE
    
    // Step 2: Property Type
    propertyType: "APARTMENT",

    // Step 3: Location
    state: "Karnataka",
    cityId: "",
    localityId: "",
    fullAddress: "",
    landmark: "",
    pincode: "",
    latitude: 12.9716, // Default Bangalore coordinates
    longitude: 77.5946,

    // Step 4: Configuration
    bhk: "",
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    totalRooms: "",

    // Step 5: Area & Details
    carpetArea: "",
    builtUpArea: "",
    superBuiltUpArea: "",
    plotArea: "",
    areaUnit: "SQFT",
    possessionStatus: "READY_TO_MOVE", // READY_TO_MOVE, UNDER_CONSTRUCTION
    facing: "EAST",
    furnishingStatus: "SEMI_FURNISHED", // UNFURNISHED, SEMI_FURNISHED, FULLY_FURNISHED
    floorNumber: "",
    totalFloors: "",
    propertyAge: "",

    // Step 6: Pricing
    price: "", // Price or Rent
    monthlyRent: "",
    securityDeposit: "",
    maintenanceCharges: "",
    leaseDuration: "",
    priceNegotiable: false,

    // Step 7: Amenities
    amenities: [] as string[], // Amenity IDs

    // Step 8: Photos
    images: [] as UploadedImage[],
    videoUrl: "",

    // Step 9: Description
    title: "",
    description: "",

    // Step 10: Contact & Preferences
    ownershipType: "FREEHOLD", // FREEHOLD, LEASEHOLD, CO_OPERATIVE, POWER_OF_ATTORNEY
    tenantPreference: "ANY", // ANY, BACHELORS, FAMILY, COMPANY, VEG, NON_VEG
    listedBy: "OWNER", // OWNER, AGENT, TENANT
    contactPhone: "",
    contactName: "",
    reraId: "",
    isReraApproved: false,
  });

  // Fetch initial configuration data
  useEffect(() => {
    async function fetchData() {
      try {
        const [citiesRes, amenitiesRes] = await Promise.all([
          fetch("/api/cities"),
          fetch("/api/amenities"),
        ]);

        const citiesData = await citiesRes.json();
        const amenitiesData = await amenitiesRes.json();

        if (citiesData.cities) setCities(citiesData.cities);
        if (amenitiesData.amenities) setAllAmenities(amenitiesData.amenities);

        // Preselect first city if no draft exists
        const savedDraft = localStorage.getItem("property_post_draft");
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setFormData(prev => ({ ...prev, ...parsed }));
            const savedStep = localStorage.getItem("property_post_step");
            if (savedStep) {
              setStep(parseInt(savedStep));
            }
          } catch (e) {
            console.error("Parse draft error:", e);
          }
        } else if (citiesData.cities && citiesData.cities.length > 0) {
          setFormData(prev => ({ ...prev, cityId: citiesData.cities[0].id }));
        }
      } catch (err) {
        console.error("Error loading config data:", err);
        setErrorMsg("Failed to load initial configuration details.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem("property_post_draft", JSON.stringify(formData));
      localStorage.setItem("property_post_step", step.toString());
      alert("Draft saved successfully! You can resume it at any time.");
    } catch (err) {
      console.error("Draft save error:", err);
    }
  };

  // Fetch localities when selected city changes
  useEffect(() => {
    if (!formData.cityId) return;

    async function fetchLocalities() {
      try {
        const res = await fetch(`/api/localities?cityId=${formData.cityId}`);
        const data = await res.json();
        if (data.localities) {
          setLocalities(data.localities);
          // Preselect first locality
          if (data.localities.length > 0) {
            setFormData(prev => ({ ...prev, localityId: data.localities[0].id }));
          } else {
            setFormData(prev => ({ ...prev, localityId: "" }));
          }
        }
      } catch (err) {
        console.error("Error loading localities:", err);
      }
    }
    fetchLocalities();
  }, [formData.cityId]);

  // Handle generic input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = value === "" ? "" : parseFloat(value);
    } else if (name === "contactPhone" || name === "phone") {
      parsedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    } else if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      parsedValue = e.target.checked;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  // Toggle Amenity check
  const handleAmenityToggle = (id: string) => {
    setFormData(prev => {
      const alreadyChecked = prev.amenities.includes(id);
      return {
        ...prev,
        amenities: alreadyChecked
          ? prev.amenities.filter(amId => amId !== id)
          : [...prev.amenities, id],
      };
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingIndex(true);
    setErrorMsg("");

    const file = files[0];

    // File validation: Size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      setUploadingIndex(false);
      return;
    }

    // Type validation
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMsg("Only JPEG, PNG, and WEBP images are supported.");
      setUploadingIndex(false);
      return;
    }

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const isFirst = formData.images.length === 0;

      const newImg: UploadedImage = {
        url: data.url,
        publicId: data.publicId,
        category: "EXTERIOR",
        isPrimary: isFirst,
        sortOrder: formData.images.length,
      };

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImg],
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to upload image.");
    } finally {
      setUploadingIndex(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingVideo(true);
    setErrorMsg("");

    const file = files[0];

    // File validation: Size limit 20MB for video
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Video file size exceeds 20MB limit.");
      setUploadingVideo(false);
      return;
    }

    // Type validation
    if (!["video/mp4", "video/webm", "video/ogg", "video/quicktime"].includes(file.type)) {
      setErrorMsg("Only MP4, WEBM, OGG, and MOV videos are supported.");
      setUploadingVideo(false);
      return;
    }

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData(prev => ({
        ...prev,
        videoUrl: data.url,
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to upload video.");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Set cover image
  const setCoverImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      })),
    }));
  };

  // Delete image
  const deleteImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  // Validation function for each step
  const validateStep = (): boolean => {
    setErrorMsg("");
    const isLandType = ["PLOT", "RESIDENTIAL_PLOT", "AGRICULTURE_LAND", "DEVELOPER_SITE", "COMMERCIAL_LAND", "INDUSTRIAL_SITE"].includes(formData.propertyType);

    switch (step) {
      case 3: // Location validation
        if (!formData.cityId || !formData.localityId) {
          setErrorMsg("Please select a City and Locality.");
          return false;
        }
        if (!formData.fullAddress.trim()) {
          setErrorMsg("Please enter a full address.");
          return false;
        }
        if (!/^[1-9]\d{5}$/.test(formData.pincode)) {
          setErrorMsg("Please enter a valid 6-digit Indian PIN code.");
          return false;
        }
        return true;

      case 5: // Area details validation
        if (isLandType) {
          if (!formData.plotArea || Number(formData.plotArea) <= 0) {
            setErrorMsg("Plot Area must be a positive number.");
            return false;
          }
        } else {
          if (!formData.carpetArea || Number(formData.carpetArea) <= 0) {
            setErrorMsg("Carpet Area must be a positive number.");
            return false;
          }
        }
        return true;

      case 6: // Pricing validation
        if (!formData.price || Number(formData.price) <= 0) {
          setErrorMsg("Price must be greater than 0.");
          return false;
        }
        return true;

      case 8: // Image validation
        if (formData.images.length === 0) {
          setErrorMsg("At least one property image is required.");
          return false;
        }
        return true;

      case 9: // Title & description
        if (formData.title.trim().length < 5) {
          setErrorMsg("Title must be at least 5 characters long.");
          return false;
        }
        if (formData.description.trim().length < 10) {
          setErrorMsg("Description must be at least 10 characters long.");
          return false;
        }
        return true;

      case 10: // Contact info
        if (!/^[6-9]\d{9}$/.test(formData.contactPhone)) {
          setErrorMsg("Please enter a valid 10-digit Indian phone number.");
          return false;
        }
        if (!formData.contactName.trim()) {
          setErrorMsg("Please enter a contact name.");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Step Navigation
  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => {
        let next = prev + 1;
        const isLandType = ["PLOT", "RESIDENTIAL_PLOT", "AGRICULTURE_LAND", "DEVELOPER_SITE", "COMMERCIAL_LAND", "INDUSTRIAL_SITE"].includes(formData.propertyType);
        if (next === 4 && isLandType) {
          next = 5; // Skip Configuration step for land
        }
        return Math.min(next, 12);
      });
    }
  };

  const prevStep = () => {
    setErrorMsg("");
    setStep(prev => {
      let next = prev - 1;
      const isLandType = ["PLOT", "RESIDENTIAL_PLOT", "AGRICULTURE_LAND", "DEVELOPER_SITE", "COMMERCIAL_LAND", "INDUSTRIAL_SITE"].includes(formData.propertyType);
      if (next === 4 && isLandType) {
        next = 3; // Skip Configuration step for land
      }
      return Math.max(next, 1);
    });
  };

  // Submit Listing (POST to API)
  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      // Map properties to API request body formats
      const parseNumber = (val: any) => {
        if (val === undefined || val === null || val === "") return null;
        const num = parseFloat(val.toString());
        return isNaN(num) ? null : num;
      };

      const parsePositiveNumber = (val: any) => {
        const num = parseNumber(val);
        return num !== null && num > 0 ? num : null;
      };

      const parseNonNegativeNumber = (val: any) => {
        const num = parseNumber(val);
        return num !== null && num >= 0 ? num : null;
      };

      const parseInteger = (val: any) => {
        if (val === undefined || val === null || val === "") return null;
        const num = parseInt(val.toString(), 10);
        return isNaN(num) ? null : num;
      };

      const parsePositiveInteger = (val: any) => {
        const num = parseInteger(val);
        return num !== null && num > 0 ? num : null;
      };

      const parseNonNegativeInteger = (val: any) => {
        const num = parseInteger(val);
        return num !== null && num >= 0 ? num : null;
      };

      const priceVal = parseFloat(formData.price.toString()) || 0;

      const payload = {
        ...formData,
        price: priceVal,
        monthlyRent: formData.transactionType === "RENT" ? (parseNonNegativeNumber(formData.monthlyRent) || priceVal) : null,
        securityDeposit: formData.transactionType === "RENT" ? parseNonNegativeNumber(formData.securityDeposit) : null,
        maintenanceCharges: parseNonNegativeNumber(formData.maintenanceCharges),
        carpetArea: parseFloat(formData.carpetArea.toString()) || 0,
        builtUpArea: parsePositiveInteger(formData.builtUpArea),
        superBuiltUpArea: parsePositiveInteger(formData.superBuiltUpArea),
        plotArea: parsePositiveInteger(formData.plotArea),
        bhk: parseNonNegativeInteger(formData.bhk),
        bedrooms: parseNonNegativeInteger(formData.bedrooms),
        bathrooms: parseNonNegativeInteger(formData.bathrooms),
        balconies: parseNonNegativeInteger(formData.balconies),
        totalRooms: parseNonNegativeInteger(formData.totalRooms),
        floorNumber: parseInteger(formData.floorNumber),
        totalFloors: parseInteger(formData.totalFloors),
        propertyAge: parseInteger(formData.propertyAge),
        leaseDuration: parsePositiveInteger(formData.leaseDuration),
        latitude: parseNumber(formData.latitude),
        longitude: parseNumber(formData.longitude),
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit property");

      // Successfully submitted as DRAFT - clear draft from local storage & redirect to dashboard list
      try {
        localStorage.removeItem("property_post_draft");
        localStorage.removeItem("property_post_step");
      } catch (e) {}
      router.push("/dashboard/properties");
    } catch (err: any) {
      console.error("Listing creation error:", err);
      setErrorMsg(err.message || "An unexpected error occurred while posting.");
    } finally {
      setSubmitting(false);
    }
  };

  // Framer Motion Animation Variants for slide transition
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: "easeInOut" }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.25, ease: "easeInOut" }
    })
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif text-lg text-primary">Loading Wizard configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Mini header */}
      <header className="border-b border-line bg-secondary px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="text-right">
          <p className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">Step {step} of 12</p>
          <div className="w-40 h-1.5 bg-line rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${(step / 12) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-5 py-8">
        
        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Wizard Form Area */}
        <div className="flex-1 bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div className="mb-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* STEP 1: TRANSACTION TYPE */}
                {step === 1 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">What is the transaction purpose?</h2>
                    <p className="text-sm text-slate-500 mb-6">Choose if you want to rent out, sell, or lease this property.</p>
                    <div className="grid grid-cols-3 gap-4">
                      {["RENT", "SALE", "LEASE"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, transactionType: type }))}
                          className={`py-6 rounded-xl border text-center font-medium transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                            formData.transactionType === type
                              ? "border-accent bg-accent/5 text-primary ring-2 ring-accent"
                              : "border-line bg-secondary hover:bg-paper text-slate-700"
                          }`}
                        >
                          <Building2 className="w-6 h-6" />
                          <span>{type === "RENT" ? "Rent out" : type === "SALE" ? "Sell" : "Lease"}</span>
                        </button>
                      ))}
                    </div>

                    {formData.transactionType === "SALE" && (
                      <div className="mt-6 border-t border-line pt-6 text-left">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">How do you want to sell?</label>
                        <select
                          name="saleType"
                          value={formData.saleType}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="FULL_HOUSE">Sell Full House</option>
                          <option value="FLOOR_WISE">Sell Floor-wise (individual floors)</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: PROPERTY TYPE */}
                {step === 2 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Select the type of property</h2>
                    <p className="text-sm text-slate-500 mb-6">Grouped into residential, commercial, and co-living categories.</p>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-3">Residential</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {["APARTMENT", "INDEPENDENT_HOUSE", "VILLA", "STUDIO_APARTMENT", "PENTHOUSE", "BUILDER_FLOOR", "FARM_HOUSE"].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                              className={`py-3 px-4 rounded-lg border text-sm text-left transition cursor-pointer ${
                                formData.propertyType === type
                                  ? "border-accent bg-accent/5 text-primary font-medium"
                                  : "border-line hover:bg-secondary text-slate-700"
                              }`}
                            >
                              {type.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-3">PG / Co-Living</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {["PG", "CO_LIVING", "SHARED_ROOM"].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                              className={`py-3 px-4 rounded-lg border text-sm text-left transition cursor-pointer ${
                                formData.propertyType === type
                                  ? "border-accent bg-accent/5 text-primary font-medium"
                                  : "border-line hover:bg-secondary text-slate-700"
                              }`}
                            >
                              {type.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-3">Commercial</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {["OFFICE_SPACE", "COWORKING_SPACE", "SHOP", "SHOWROOM", "WAREHOUSE", "INDUSTRIAL_PROPERTY", "COMMERCIAL_LAND", "RESORT", "INDUSTRIAL_SITE", "INDUSTRIAL_BUILDING", "HOTEL", "COMMERCIAL_COMPLEX"].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                              className={`py-3 px-4 rounded-lg border text-sm text-left transition cursor-pointer ${
                                formData.propertyType === type
                                  ? "border-accent bg-accent/5 text-primary font-medium"
                                  : "border-line hover:bg-secondary text-slate-700"
                              }`}
                            >
                              {type.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-3">Plots & Land</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {["PLOT", "RESIDENTIAL_PLOT", "AGRICULTURE_LAND", "DEVELOPER_SITE"].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                              className={`py-3 px-4 rounded-lg border text-sm text-left transition cursor-pointer ${
                                formData.propertyType === type
                                  ? "border-accent bg-accent/5 text-primary font-medium"
                                  : "border-line hover:bg-secondary text-slate-700"
                              }`}
                            >
                              {type.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: LOCATION DETAILS */}
                {step === 3 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Where is the property located?</h2>
                    <p className="text-sm text-slate-500 mb-6">Select a normalized city and locality to help users find it.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">City *</label>
                        <select
                          name="cityId"
                          value={formData.cityId}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Locality *</label>
                        <select
                          name="localityId"
                          value={formData.localityId}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          {localities.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Address *</label>
                        <input
                          type="text"
                          name="fullAddress"
                          value={formData.fullAddress}
                          onChange={handleChange}
                          placeholder="e.g. Flat 405, Block B, Silver Oak Apartments"
                          className="w-full border border-line rounded-lg px-3 py-2.5 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Landmark</label>
                        <input
                          type="text"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          placeholder="e.g. Near HDFC Bank"
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">PIN Code *</label>
                        <input
                          type="text"
                          name="pincode"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="e.g. 560066"
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: CONFIGURATION */}
                {step === 4 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">What is the space configuration?</h2>
                    <p className="text-sm text-slate-500 mb-6">Define the number of bedrooms, bathrooms, and balconies.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">BHK Size (if applicable)</label>
                        <input
                          type="number"
                          name="bhk"
                          min={0}
                          value={formData.bhk || 0}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Bedrooms</label>
                        <input
                          type="number"
                          name="bedrooms"
                          min={0}
                          value={formData.bedrooms || 0}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Bathrooms</label>
                        <input
                          type="number"
                          name="bathrooms"
                          min={0}
                          value={formData.bathrooms || 0}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Balconies</label>
                        <input
                          type="number"
                          name="balconies"
                          min={0}
                          value={formData.balconies || 0}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Total Rooms</label>
                        <input
                          type="number"
                          name="totalRooms"
                          min={0}
                          value={formData.totalRooms || 0}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: AREA & PROPERTY DETAILS */}
                {step === 5 && (() => {
                  const isLandType = ["PLOT", "RESIDENTIAL_PLOT", "AGRICULTURE_LAND", "DEVELOPER_SITE", "COMMERCIAL_LAND", "INDUSTRIAL_SITE"].includes(formData.propertyType);
                  return (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">{isLandType ? "Area & Details" : "Area & Building Details"}</h2>
                    <p className="text-sm text-slate-500 mb-6">{isLandType ? "Describe the dimensions and facing of the land." : "Describe the sizes, furnishing status, and building direction."}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {!isLandType && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Carpet Area (sqft) *</label>
                            <input
                              type="number"
                              name="carpetArea"
                              min={1}
                              value={formData.carpetArea}
                              onChange={handleChange}
                              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Built-up Area (sqft)</label>
                            <input
                              type="number"
                              name="builtUpArea"
                              min={1}
                              value={formData.builtUpArea || ""}
                              onChange={handleChange}
                              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Super Built-up Area (sqft)</label>
                            <input
                              type="number"
                              name="superBuiltUpArea"
                              min={1}
                              value={formData.superBuiltUpArea || ""}
                              onChange={handleChange}
                              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Plot Area (sqft) {isLandType ? "*" : ""}</label>
                        <input
                          type="number"
                          name="plotArea"
                          min={1}
                          value={formData.plotArea || ""}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>

                      {!isLandType && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Furnishing Status</label>
                            <select
                              name="furnishingStatus"
                              value={formData.furnishingStatus}
                              onChange={handleChange}
                              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                            >
                              <option value="UNFURNISHED">Unfurnished</option>
                              <option value="SEMI_FURNISHED">Semi Furnished</option>
                              <option value="FULLY_FURNISHED">Fully Furnished</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Possession Status</label>
                            <select
                              name="possessionStatus"
                              value={formData.possessionStatus}
                              onChange={handleChange}
                              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                            >
                              <option value="READY_TO_MOVE">Ready to Move</option>
                              <option value="UNDER_CONSTRUCTION">Under Construction</option>
                            </select>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Facing Direction</label>
                        <select
                          name="facing"
                          value={formData.facing}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        >
                          <option value="EAST">East</option>
                          <option value="WEST">West</option>
                          <option value="NORTH">North</option>
                          <option value="SOUTH">South</option>
                          <option value="NORTHEAST">North-East</option>
                          <option value="NORTHWEST">North-West</option>
                          <option value="SOUTHEAST">South-East</option>
                          <option value="SOUTHWEST">South-West</option>
                        </select>
                      </div>

                      {!isLandType && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Floor Number</label>
                            <input
                              type="number"
                              name="floorNumber"
                              value={formData.floorNumber}
                              onChange={handleChange}
                              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Total Floors in Building</label>
                            <input
                              type="number"
                              name="totalFloors"
                              value={formData.totalFloors}
                              onChange={handleChange}
                              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  );
                })()}

                {/* STEP 6: PRICING DETAILS */}
                {step === 6 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Price &amp; Charges (₹)</h2>
                    <p className="text-sm text-slate-500 mb-6">Enter the pricing details. All values must be in Indian Rupees (₹).</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          {formData.transactionType === "RENT" ? "Monthly Rent (₹) *" : "Asking Price (₹) *"}
                        </label>
                        <input
                          type="number"
                          name="price"
                          min={1}
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2.5 bg-secondary text-slate-700 text-lg font-semibold"
                        />
                      </div>

                      {formData.transactionType === "RENT" && (
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">Security Deposit (₹)</label>
                          <input
                            type="number"
                            name="securityDeposit"
                            min={0}
                            value={formData.securityDeposit}
                            onChange={handleChange}
                            className="w-full border border-line rounded-lg px-3 py-2.5 bg-secondary text-slate-700 text-lg font-semibold"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Monthly Maintenance Charges (₹)</label>
                        <input
                          type="number"
                          name="maintenanceCharges"
                          min={0}
                          value={formData.maintenanceCharges}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <input
                          type="checkbox"
                          id="priceNegotiable"
                          name="priceNegotiable"
                          checked={formData.priceNegotiable}
                          onChange={(e) => setFormData(prev => ({ ...prev, priceNegotiable: e.target.checked }))}
                          className="w-5 h-5 rounded border-line text-accent"
                        />
                        <label htmlFor="priceNegotiable" className="text-sm font-medium text-slate-700">Price is Negotiable</label>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: AMENITIES */}
                {step === 7 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Select property amenities</h2>
                    <p className="text-sm text-slate-500 mb-6">Select the amenities available on-site or in the community.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2">
                      {allAmenities.map((amenity) => {
                        const isChecked = formData.amenities.includes(amenity.id);
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => handleAmenityToggle(amenity.id)}
                            className={`py-3 px-4 rounded-lg border text-sm text-left transition cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? "border-accent bg-accent/5 text-primary font-medium"
                                : "border-line bg-secondary hover:bg-paper text-slate-700"
                            }`}
                          >
                            <span>{amenity.name}</span>
                            {isChecked && <Check className="w-4 h-4 text-accent shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 8: PHOTOS */}
                {step === 8 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Upload property photos</h2>
                    <p className="text-sm text-slate-500 mb-6">Upload at least 1 image. Drag/select files under 5MB. Select a primary cover photo.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      {/* Image Upload Button */}
                      <label className="border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-accent hover:bg-secondary transition h-32 relative">
                        {uploadingIndex ? (
                          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400 mb-2" />
                            <span className="text-xs font-semibold text-slate-600">Upload Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingIndex}
                          className="hidden"
                        />
                      </label>

                      {/* Render Uploaded Images */}
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden group h-32 border border-line">
                          <img
                            src={img.url}
                            alt="Property upload"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCoverImage(idx)}
                              className={`p-1.5 rounded-full ${img.isPrimary ? "bg-accent text-primary" : "bg-white/80 text-primary hover:bg-white"} transition`}
                              title="Set as Cover Photo"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteImage(idx)}
                              className="p-1.5 rounded-full bg-white/80 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                              title="Delete Photo"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                          {img.isPrimary && (
                            <span className="absolute top-2 left-2 bg-accent text-primary text-[10px] font-bold px-2 py-0.5 rounded shadow">
                              COVER
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Video Upload Section */}
                    <div className="border-t border-line pt-6 mt-6 text-left">
                      <h3 className="text-sm font-semibold text-primary mb-1">Upload Property Video (Optional)</h3>
                      <p className="text-xs text-slate-500 mb-4">Select an MP4, WEBM, or MOV video file up to 20MB.</p>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <label className="border border-line rounded-xl flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:border-accent hover:bg-secondary transition bg-white text-sm font-medium text-slate-700">
                          {uploadingVideo ? (
                            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Upload className="w-4 h-4 text-slate-400" />
                          )}
                          <span>{uploadingVideo ? "Uploading video..." : "Select Video File"}</span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            disabled={uploadingVideo}
                            className="hidden"
                          />
                        </label>

                        {formData.videoUrl && (
                          <div className="flex items-center justify-between w-full sm:w-auto gap-3 bg-secondary border border-line rounded-xl px-4 py-2 text-xs">
                            <span className="truncate max-w-[200px] text-slate-600 font-mono">Video attached!</span>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, videoUrl: "" }))}
                              className="text-red-600 hover:text-red-700 font-bold font-mono hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 9: TITLE & DESCRIPTION */}
                {step === 9 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Listing Title &amp; Description</h2>
                    <p className="text-sm text-slate-500 mb-6">Create an attractive title and describe the key selling points of the property.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Property Listing Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="e.g. Spacious 2 BHK Flat with Balcony near HSR Layout"
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Detailed Description *</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                          placeholder="Describe the rooms, distance to hubs, amenities, layout, and any special preferences..."
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed text-sm"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 10: CONTACT & PREFERENCES */}
                {step === 10 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Preferences, Compliance &amp; Contact</h2>
                    <p className="text-sm text-slate-500 mb-6">Verify ownership details, RERA compliance, and who to contact.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Listed By (Who is uploading this?) *</label>
                        <select
                          name="listedBy"
                          value={formData.listedBy}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="OWNER">Owner</option>
                          <option value="AGENT">Agent</option>
                          <option value="TENANT">Tenant / Seeker</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Ownership Type</label>
                        <select
                          name="ownershipType"
                          value={formData.ownershipType}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="FREEHOLD">Freehold</option>
                          <option value="LEASEHOLD">Leasehold</option>
                          <option value="CO_OPERATIVE">Co-operative Society</option>
                          <option value="POWER_OF_ATTORNEY">Power of Attorney</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Tenant Preference</label>
                        <select
                          name="tenantPreference"
                          value={formData.tenantPreference}
                          onChange={handleChange}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="ANY">Any (No preferences)</option>
                          <option value="FAMILY">Families Only</option>
                          <option value="BACHELORS">Bachelors Only</option>
                          <option value="COMPANY">Company Leases Only</option>
                          <option value="VEG">Veg Only</option>
                          <option value="NON_VEG">Non-Veg Preferred / Allowed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact Name *</label>
                        <input
                          type="text"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleChange}
                          placeholder="e.g. Ramesh Prasad"
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact Phone Number *</label>
                        <input
                          type="text"
                          name="contactPhone"
                          maxLength={10}
                          value={formData.contactPhone}
                          onChange={handleChange}
                          placeholder="e.g. 9876543210"
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>

                      <div className="sm:col-span-2 border-t border-line pt-4 mt-2">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            id="isReraApproved"
                            name="isReraApproved"
                            checked={formData.isReraApproved}
                            onChange={(e) => setFormData(prev => ({ ...prev, isReraApproved: e.target.checked }))}
                            className="w-5 h-5 rounded border-line text-accent"
                          />
                          <label htmlFor="isReraApproved" className="text-sm font-semibold text-slate-700">RERA Approved Property</label>
                        </div>
                        
                        {formData.isReraApproved && (
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">RERA Registration ID</label>
                            <input
                              type="text"
                              name="reraId"
                              value={formData.reraId}
                              onChange={handleChange}
                              placeholder="e.g. PRM/KA/RERA/..."
                              className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 11: PREVIEW */}
                {step === 11 && (
                  <div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Review your property details</h2>
                    <p className="text-sm text-slate-500 mb-6">Review before submitting. The listing will start as a DRAFT.</p>
                    
                    <div className="border border-line rounded-xl overflow-hidden bg-secondary">
                      {formData.images.length > 0 && (
                        <div className="h-48 relative">
                          <img
                            src={formData.images.find(i => i.isPrimary)?.url || formData.images[0].url}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-3 left-3 bg-primary text-secondary text-xs px-3 py-1 rounded font-semibold uppercase">
                            {formData.transactionType}
                          </span>
                        </div>
                      )}
                      
                      <div className="p-4 space-y-3 bg-white">
                        <h3 className="text-lg font-serif text-primary">{formData.title || "Untitled Property"}</h3>
                        <p className="text-2xl font-bold text-primary">
                          ₹{Number(formData.price || 0).toLocaleString("en-IN")}{formData.transactionType === "RENT" ? "/mo" : ""}
                        </p>
                        
                        <div className="flex gap-4 text-xs font-medium text-slate-500 border-y border-line py-2.5 my-2">
                          {formData.bhk && <span>{formData.bhk} BHK</span>}
                          <span>{formData.carpetArea} {formData.areaUnit}</span>
                          <span>{formData.furnishingStatus.replace("_", " ")}</span>
                          <span>{formData.possessionStatus.replace("_", " ")}</span>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-3">{formData.description || "No description provided."}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 12: SUBMIT FOR VERIFICATION */}
                {step === 12 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-2">Ready to list your house?</h2>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                      By clicking submit, your property will be saved as a **DRAFT**. You can verify and activate it later from your dashboard.
                    </p>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-secondary px-8 py-3.5 rounded-full font-semibold text-base transition duration-300 shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Submit Property Listing"
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Wizard Action Buttons */}
          {step < 12 && (
            <div className="flex items-center justify-between border-t border-line pt-5 mt-4">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-1.5 px-4 py-2 border border-line rounded-lg font-semibold text-sm hover:bg-secondary transition text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={saveDraft}
                className="flex items-center gap-1.5 px-4 py-2 border border-line rounded-lg font-semibold text-sm hover:bg-secondary transition text-slate-600 cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-secondary rounded-lg font-semibold text-sm hover:bg-primary/95 transition cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
