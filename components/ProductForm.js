import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";
import { assetPrefix } from "@/next.config";

export default function ProductForm({
    _id,
    title:existingTitle, 
    description:existingDescription, 
    price:existingPrice,
    images: existingImages,
    category: assignedCategory,
    properties: assignedProperties
}){
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription ||'');
    const [category, setCategory] =useState(assignedCategory || '');
    const [productProperties, setProductProperties] = useState(assignedProperties || {});
    const [price, setPrice] = useState(existingPrice || '');
    const [goToProducts, setGoToProducts] = useState(false);
    const [images, setImages] = useState(existingImages || []);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const router = useRouter();

    useEffect(()=> {
        axios.get('/api/categories').then(result=>{
            setCategories(result.data);
        })
    }, [])

    async function saveProduct(ev){
        ev.preventDefault();

        const data =  {
            title, description, price, images, category, 
            properties: productProperties};
        if(_id){
            //update
            await axios.put('/api/products', {...data, _id});
        }else{
            //create
            await axios.post('/api/products', data)
        }
        setGoToProducts(true);
        
    }
    if(goToProducts){
        router.push('/products');
    }

    async function uploadImages(ev){
        const files = ev.target?.files;
        if(files?.length > 0){
            setIsUploading(true);
            const data = new FormData();
            for(const file of files){
                data.append('file', file);
            }

            const res = await axios.post('/api/upload', data)
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            })
            setIsUploading(false);
        }
    }

    function updateImagesOrder(images){
        setImages(images)
    }

    function setProductProp(propName, value){
        setProductProperties(prev => {
            const newProductProps = {...prev};
            newProductProps[propName]=value;
            return newProductProps;
        })
    }

    const propertiesToFill = [];
    if(categories.length>0 && category){
        let catInfo = categories.find(({_id}) => _id === category);
        propertiesToFill.push(...catInfo.properties);

        //add properties of parent category 
        while(catInfo?.parent?._id){
            const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
            propertiesToFill.push(...parentCat.properties);
            catInfo = parentCat;
        }
    }
    return(

        <form onSubmit={saveProduct}>
            {/* <h1 className="">New Product</h1> */}

            <label> Product Name</label>
            <input type="text" 
                placeholder="product name" 
                value={title} 
                onChange={ev=> setTitle(ev.target.value)}>
            </input>

            <label>Category</label>
            <select value={category}
            onChange={ev => setCategory(ev.target.value)}>
                <option value="">UnCategorized</option>
                {categories.length>0 && categories.map(c=>(
                    <option value={c._id}>{c.name}</option>
                ))}
            </select>

            {categories.length> 0 && propertiesToFill.map(p => (
                    <div className="flex gap-1">
                        <div>
                            {p.name}
                        </div>
                        <select 
                        value={productProperties[p.name]}
                        onChange={ev => 
                        setProductProp(p.name, ev.target.value)}>
                            
                        {p.values.map(v=>(
                            <option value={v}>{v}</option>
                        ))}
                        </select>
                    </div>
                ))}

            <label>
                Photos
            </label>
            <div className="mb-2 flex flex-wrap gap-1">

            {/* //react sortable for moving images around */}
            <ReactSortable 
            className="flex flex-wrap gap-1"
            list={images}
            setList={updateImagesOrder}>
            {!!images?.length && images.map(link=>(
                <div key={link} className="h-24 inline-block">
                    <img src={link} className="rounded-lg"/>
                </div>
            ))}
            </ReactSortable>
            
            {isUploading && (
                <div className="h-24 flex items-center p-1 ml-2">
                <Spinner/>
                </div>
            )}
                <label className="inline-block w-24 h-24 flex text-center justify-center items-center text-gray-500 rounded-lg bg-gray-200 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>

                    <input onChange={uploadImages} className="hidden" type="file"/>
                </label>
                
                
            </div>

            <label> Description</label>
            <textarea placeholder="description"
                    value={description} 
                    onChange={ev=> setDescription(ev.target.value)}>
            </textarea>

            <label> Price (in INR)</label>
            <input type="number" placeholder="price"
                    value={price} 
                    onChange={ev=> setPrice(ev.target.value)}>
            </input>

            <button type="submit" className="btn-primary">Save</button>
        </form>

    )
}