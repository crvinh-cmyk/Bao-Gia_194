import os
import subprocess

OUT_DIR = "public/images/frames"
os.makedirs(OUT_DIR, exist_ok=True)

frames = [
    {
        "filename": "titan1-den.jpg",
        "title": "KHUNG TITAN T1 - DEN MO",
        "specs": "Vien kim loai Titan sieu mong 1.0cm - Ma PVD Den Mo",
        "bg_grad": "gradient:#f3efe9-#dfd7cc",
        "outer_border": "#1c1917",
        "frame_color": "#181716",
        "frame_inner": "#2a2928",
        "inner_w": 18,
        "photo_grad": "gradient:#ded6cb-#baa898",
        "accent": "#e7c184",
        "tag": "TITAN T1 BLACK MATTE",
    },
    {
        "filename": "titan1-bac.jpg",
        "title": "KHUNG TITAN T1 - BAC XUOC",
        "specs": "Vien kim loai Titan sieu mong 1.0cm - Anh Kim Bac Sang",
        "bg_grad": "gradient:#f5f2ee-#e4ded8",
        "outer_border": "#8e9196",
        "frame_color": "#dcdde1",
        "frame_inner": "#f1f2f6",
        "inner_w": 18,
        "photo_grad": "gradient:#e8e1d7-#c9b6a3",
        "accent": "#936b34",
        "tag": "TITAN T1 SILVER BRUSH",
    },
    {
        "filename": "titan2-xanh.jpg",
        "title": "KHUNG TITAN T2 - XANH REU",
        "specs": "Vien kim loai Titan cao cap - Ma PVD Xanh Reu Thoi Trang",
        "bg_grad": "gradient:#f2f4f1-#dadfd8",
        "outer_border": "#2d3e35",
        "frame_color": "#3b5245",
        "frame_inner": "#4f695a",
        "inner_w": 20,
        "photo_grad": "gradient:#e5ded3-#baa997",
        "accent": "#e7c184",
        "tag": "TITAN T2 FOREST METALLIC",
    },
    {
        "filename": "titan2-hong.jpg",
        "title": "KHUNG TITAN T2 - HONG CHAMPAGNE",
        "specs": "Vien kim loai Titan cao cap - Vang Hong Rose Gold Anh Kim",
        "bg_grad": "gradient:#f7f0ed-#e6dbd6",
        "outer_border": "#8c5b52",
        "frame_color": "#b87d72",
        "frame_inner": "#d99d91",
        "inner_w": 20,
        "photo_grad": "gradient:#f3e8dd-#cfbba7",
        "accent": "#4a2820",
        "tag": "TITAN T2 ROSE GOLD",
    },
    {
        "filename": "k4-trang.jpg",
        "title": "KHUNG HOP K4 - TRANG TINH KHOI",
        "specs": "Khung hop 3.5cm (Shadow Box) - Trang su decor hien dai",
        "bg_grad": "gradient:#f0ede7-#ded9d0",
        "outer_border": "#cfcac2",
        "frame_color": "#ffffff",
        "frame_inner": "#eae7e1",
        "inner_w": 46,
        "photo_grad": "gradient:#ebe2d5-#c5b19d",
        "accent": "#936b34",
        "tag": "SHADOW BOX K4 WHITE 3.5CM",
    },
    {
        "filename": "k5-denmo.jpg",
        "title": "KHUNG HOP K5 - DEN MO NHUNG",
        "specs": "Khung hop 3.5cm (Shadow Box) - Den sau chong va quet anh",
        "bg_grad": "gradient:#eeeae4-#dcd6cd",
        "outer_border": "#111111",
        "frame_color": "#1f1e1d",
        "frame_inner": "#0d0c0c",
        "inner_w": 46,
        "photo_grad": "gradient:#e0d6cb-#baa796",
        "accent": "#e7c184",
        "tag": "SHADOW BOX K5 BLACK 3.5CM",
    },
    {
        "filename": "k6-caffe.jpg",
        "title": "KHUNG HOP K6 - MAU CAFE",
        "specs": "Khung hop 3.5cm (Shadow Box) - Go oc cho nau tram sang trong",
        "bg_grad": "gradient:#f1ece5-#dfd8ce",
        "outer_border": "#2c1c14",
        "frame_color": "#3f281d",
        "frame_inner": "#241610",
        "inner_w": 46,
        "photo_grad": "gradient:#e6ded4-#c2afa0",
        "accent": "#e7c184",
        "tag": "SHADOW BOX K6 CAFE WALNUT",
    },
    {
        "filename": "k6-gonhat.jpg",
        "title": "KHUNG HOP K6 - GO NHAT",
        "specs": "Khung hop 3.5cm (Shadow Box) - Go soi sang Scandinavian",
        "bg_grad": "gradient:#f5f1eb-#e2dbcf",
        "outer_border": "#6e523c",
        "frame_color": "#a8815f",
        "frame_inner": "#6e523c",
        "inner_w": 46,
        "photo_grad": "gradient:#ece3d6-#cbbaaa",
        "accent": "#3a2517",
        "tag": "SHADOW BOX K6 NATURAL OAK",
    },
    {
        "filename": "k10-naudam.jpg",
        "title": "KHUNG BAN RONG K10 - NAU DAM",
        "specs": "Khung phao dai 5.5cm - Nau go be the cho anh gia dinh",
        "bg_grad": "gradient:#f3ede6-#ded4c8",
        "outer_border": "#2b1a11",
        "frame_color": "#4a2a1a",
        "frame_inner": "#c69239",
        "inner_w": 68,
        "photo_grad": "gradient:#e8ddcf-#bfa996",
        "accent": "#f1c40f",
        "tag": "GRAND FRAME K10 DARK BROWN 5.5CM",
    },
]

W = 900
H = 1100

for f in frames:
    out_path = os.path.join(OUT_DIR, f["filename"])
    
    # Coordinates
    fx1 = 120
    fy1 = 140
    fx2 = W - 120
    fy2 = H - 180
    
    iw = f["inner_w"]
    px1 = fx1 + iw
    py1 = fy1 + iw
    px2 = fx2 - iw
    py2 = fy2 - iw
    
    cmd = [
        "convert",
        "-size", f"{W}x{H}", f["bg_grad"],
        
        # Soft Wall drop shadow behind whole frame
        "-fill", "rgba(0,0,0,0.18)",
        "-draw", f"rectangle {fx1+12},{fy1+16} {fx2+12},{fy2+16}",
        "-fill", "rgba(0,0,0,0.10)",
        "-draw", f"rectangle {fx1+20},{fy1+24} {fx2+20},{fy2+24}",
        
        # Outer Frame
        "-fill", f["frame_color"],
        "-stroke", f["outer_border"],
        "-strokewidth", "3",
        "-draw", f"rectangle {fx1},{fy1} {fx2},{fy2}",
        
        # Inner Frame stepped edge
        "-fill", f["frame_inner"],
        "-stroke", "none",
        "-draw", f"rectangle {fx1+int(iw*0.6)},{fy1+int(iw*0.6)} {fx2-int(iw*0.6)},{fy2-int(iw*0.6)}",
        
        # Inner drop shadow (depth into photo)
        "-fill", "rgba(0,0,0,0.35)",
        "-draw", f"rectangle {px1},{py1} {px2},{py2}",
        
        # Photo area
        "-fill", "#f8f5f0",
        "-stroke", "none",
        "-draw", f"rectangle {px1+4},{py1+4} {px2-4},{py2-4}",
        
        # Photo simulated wedding/studio scene with warm gradient
        "-fill", "#2b2826",
        "-draw", f"rectangle {px1+4},{py1+4} {px2-4},{py2-4}",
        
        # Groom silhouette
        "-fill", "#181716",
        "-draw", f"circle {int((px1+px2)/2 + 60)},{py1 + 180} {int((px1+px2)/2 + 60)},{py1 + 240}",
        "-draw", f"polygon {int((px1+px2)/2 - 10)},{py2-4} {int((px1+px2)/2 + 150)},{py2-4} {int((px1+px2)/2 + 90)},{py1+220} {int((px1+px2)/2 + 40)},{py1+220}",
        
        # Bride silhouette & veil
        "-fill", "#ded6ca",
        "-draw", f"circle {int((px1+px2)/2 - 50)},{py1 + 200} {int((px1+px2)/2 - 50)},{py1 + 255}",
        "-fill", "#ffffff",
        "-draw", f"polygon {int((px1+px2)/2 - 180)},{py2-4} {int((px1+px2)/2 + 40)},{py2-4} {int((px1+px2)/2 - 20)},{py1+240} {int((px1+px2)/2 - 80)},{py1+240}",
        
        # Soft romantic studio spotlight
        "-fill", "rgba(255,255,255,0.18)",
        "-draw", f"circle {int((px1+px2)/2)},{py1+240} {int((px1+px2)/2)},{py1+450}",
        
        # Glass reflection shine (diagonal)
        "-fill", "rgba(255,255,255,0.12)",
        "-draw", f"polygon {px1+4},{py1+4} {px1+140},{py1+4} {px2-4},{py2-100} {px2-4},{py2-4}",
        
        # Top Header Tag Badge
        "-fill", "#1c1917",
        "-stroke", "#333333",
        "-strokewidth", "1",
        "-draw", f"roundrectangle 40,40 {W-40},100 12,12",
        
        "-fill", "#e7c184",
        "-pointsize", "14",
        "-font", "DejaVu-Sans-Bold",
        "-gravity", "northwest",
        "-annotate", "+60+52", "TIEM IN 194  |  ANH MAU CHUP THUC TE TAI XUONG",
        
        "-fill", "#ffffff",
        "-pointsize", "20",
        "-font", "DejaVu-Sans-Bold",
        "-annotate", "+60+72", f["title"],
        
        # Tag pill
        "-fill", "#936b34",
        "-stroke", "none",
        "-draw", f"roundrectangle {W-290},52 {W-60},88 8,8",
        "-fill", "#ffffff",
        "-pointsize", "12",
        "-font", "DejaVu-Sans-Bold",
        "-annotate", f"+{W-280}+64", f["tag"],
        
        # Bottom Specs Box
        "-fill", "#ffffff",
        "-stroke", "#e5e0d8",
        "-strokewidth", "1",
        "-draw", f"roundrectangle 60,{H-140} {W-60},{H-50} 12,12",
        
        "-fill", "#1c1917",
        "-pointsize", "16",
        "-font", "DejaVu-Sans-Bold",
        "-annotate", f"+80+{H-125}", f["specs"],
        
        "-fill", "#78716c",
        "-pointsize", "13",
        "-font", "DejaVu-Sans",
        "-annotate", f"+80+{H-95}", "Quy cach: Gia cong goc 45 do khong ho vien - Mat kinh / Mika sieu trong",
        
        "-quality", "92",
        out_path
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error on {f['filename']}: {res.stderr}")
    else:
        print(f"Generated {out_path} ({os.path.getsize(out_path)} bytes)")

print("All frames completed.")
