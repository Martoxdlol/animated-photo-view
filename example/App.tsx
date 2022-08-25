import * as React from 'react';
import AnimatedPhotoView, { AnimatedPhotoViewController } from 'animated-photo-view'
import { usePhotoViewController } from '../dist/AnimatedPhotoView';

function PhotoViewerUI() {
  const controller = usePhotoViewController()
  return <span style={{ color: 'white' }}>Hola - <button onClick={() => controller.closeView()}>Cerrar</button></span>
}

export default function App() {
  const controller = new AnimatedPhotoViewController()
  return <div>
    <h1>Hello World</h1>
    <AnimatedPhotoView controller={controller}>
      <PhotoViewerUI />
    </AnimatedPhotoView>
    <img src='https://cdn.pixabay.com/photo/2022/05/09/11/20/flower-7184366_960_720.jpg' width={300} onClick={(e: any) => controller.openView(e.target)} />
  </div>
}