from io import BytesIO
from PIL import Image, ImageDraw, ImageOps, ImageFont
from PIL.ImageFont import FreeTypeFont
import os

class GeneratePostUsecase:
    def __call__(self, ):
        return self.__generate()
    
    def listar_archivos_recursivamente(self,carpeta):
        response = []
        for ruta_actual, carpetas, archivos in os.walk(carpeta):
            for archivo in archivos:
                ruta_completa = os.path.join(ruta_actual, archivo)
                if(ruta_completa.endswith('Signature.jpg')):
                    response.append(ruta_completa)
        return response
            
    def __generate(self, ):
        
        path = 'dev/origin'
        archivos = self.listar_archivos_recursivamente(path)
        
        original_signature_size = 0
        new_signature_size = 0
        for file in archivos:
            print(file)
            img = Image.open(file)
            width, height = img.size
            print(width, height)
            max_width = 300
            print(1,img.mode)
            try:
                image_bytes = img.tobytes()
                print(2)
                original_size = len(image_bytes)/1024

                
                original_signature_size += original_size
                if(width > max_width):

                    factor = width / max_width

                    new_height = int(height / factor)
                    print(max_width, new_height)
                    
                    print("Bytes: ", original_size, "KB")
                    resized_img = img.resize((max_width, new_height))
                    imagen_blanca = Image.new("RGBA", (max_width, new_height), (255, 255, 255, 255))
                    
                    
                    post = Image.alpha_composite(imagen_blanca, resized_img)
        
                    resized_img_bytes = resized_img.tobytes()
                    new_size = len(resized_img_bytes)/1024
                    print("Bytes: ", new_size, "KB")
                    
                    improve = new_size / original_size * 100
                    print("Improvement: ",improve)
                    
                    post = post.convert('RGB')
                    
                    post.save(file)
                    new_signature_size += new_size
                else:
                    new_signature_size += original_size
            except Exception as e:
                print("Error", e)
                
        print('Folder size: ', original_signature_size)
        print('New folder size: ', new_signature_size)
        print(new_signature_size * 100 / original_signature_size )
            


obj = GeneratePostUsecase()
obj()
